from io import BytesIO
from pathlib import Path
from warnings import catch_warnings, simplefilter

from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils.text import get_valid_filename
from PIL import Image, ImageOps, UnidentifiedImageError
from PIL.Image import DecompressionBombError, DecompressionBombWarning
from rest_framework import serializers


ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

ALLOWED_IMAGE_FORMATS = {
    "JPEG",
    "PNG",
    "WEBP",
    "GIF",
}

MAX_BOAT_IMAGE_COUNT = 10
MAX_BOAT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
MAX_AVATAR_IMAGE_SIZE_BYTES = 2 * 1024 * 1024
MAX_IMAGE_WIDTH_PX = 8000
MAX_IMAGE_HEIGHT_PX = 8000
MAX_IMAGE_TOTAL_PIXELS = 25_000_000

# Stored image size after sanitizing/optimizing.
# This keeps uploaded camera photos from being stored as huge 4000px+ files.
MAX_STORED_IMAGE_WIDTH_PX = 1600
MAX_STORED_IMAGE_HEIGHT_PX = 1600

# Make Pillow reject decompression-bomb candidates before full decoding.
# This protects memory before image.load() is ever reached.
Image.MAX_IMAGE_PIXELS = MAX_IMAGE_TOTAL_PIXELS

SANITIZED_WEBP_QUALITY = 82
SANITIZED_WEBP_METHOD = 6
SANITIZED_IMAGE_SUFFIX = "optimized"


class ImageUploadInfo:
    def __init__(self, image_format, width, height):
        self.image_format = image_format
        self.width = width
        self.height = height


def _build_invalid_type_message(field_label):
    return f"{field_label} must be a JPG, PNG, WEBP, or GIF image."


def _remember_position(upload):
    if hasattr(upload, "tell"):
        try:
            return upload.tell()
        except (OSError, ValueError):
            return None

    return None


def _restore_position(upload, position):
    if hasattr(upload, "seek"):
        try:
            upload.seek(position or 0)
        except (OSError, ValueError):
            pass


def _validate_image_dimensions(image, *, field_label):
    width, height = image.size
    total_pixels = width * height

    if (
        width > MAX_IMAGE_WIDTH_PX
        or height > MAX_IMAGE_HEIGHT_PX
        or total_pixels > MAX_IMAGE_TOTAL_PIXELS
    ):
        raise serializers.ValidationError(
            f"{field_label} dimensions are too large. "
            f"Maximum supported size is {MAX_IMAGE_WIDTH_PX}x{MAX_IMAGE_HEIGHT_PX} pixels "
            f"and {MAX_IMAGE_TOTAL_PIXELS:,} total pixels."
        )

    return width, height


def _inspect_image_bytes(upload, *, field_label):
    current_position = _remember_position(upload)

    try:
        with catch_warnings():
            simplefilter("error", DecompressionBombWarning)

            with Image.open(upload) as image:
                image_format = (image.format or "").upper()

                width, height = _validate_image_dimensions(
                    image,
                    field_label=field_label,
                )

                if image_format not in ALLOWED_IMAGE_FORMATS:
                    raise serializers.ValidationError(
                        _build_invalid_type_message(field_label)
                    )

                image.verify()

        if hasattr(upload, "seek"):
            upload.seek(0)

        with catch_warnings():
            simplefilter("error", DecompressionBombWarning)

            with Image.open(upload) as image:
                image_format = (image.format or "").upper()

                width, height = _validate_image_dimensions(
                    image,
                    field_label=field_label,
                )

                if image_format not in ALLOWED_IMAGE_FORMATS:
                    raise serializers.ValidationError(
                        _build_invalid_type_message(field_label)
                    )

                image.load()

        return ImageUploadInfo(
            image_format=image_format,
            width=width,
            height=height,
        )

    except serializers.ValidationError:
        raise

    except (DecompressionBombWarning, DecompressionBombError):
        raise serializers.ValidationError(
            f"{field_label} is too large or complex to be processed safely."
        )

    except (UnidentifiedImageError, OSError, ValueError):
        raise serializers.ValidationError(
            f"{field_label} must be a valid, non-corrupted image file."
        )

    finally:
        _restore_position(upload, current_position)


def _image_has_alpha(image):
    if image.mode in ("RGBA", "LA"):
        return True

    if image.mode == "P" and "transparency" in image.info:
        return True

    return False


def _build_sanitized_filename(original_name, extension):
    original_name = original_name or "upload"
    stem = Path(original_name).stem or "upload"
    safe_stem = get_valid_filename(stem) or "upload"

    return f"{safe_stem}_{SANITIZED_IMAGE_SUFFIX}.{extension}"


def _resize_for_storage(image):
    """
    Resize image in-place if it is larger than the stored image limit.

    thumbnail() keeps the original aspect ratio and never upscales small images.
    """
    image.thumbnail(
        (MAX_STORED_IMAGE_WIDTH_PX, MAX_STORED_IMAGE_HEIGHT_PX),
        Image.Resampling.LANCZOS,
    )

    return image


def _prepare_image_for_saving(image):
    """
    Normalize and optimize the image before storing it:

    - apply EXIF orientation to the actual pixels
    - drop EXIF and metadata by saving into a fresh file
    - convert animated images to their first frame
    - resize very large uploads to a web-friendly maximum size
    - convert every accepted upload to WebP

    WebP supports normal photos and transparency, so JPG/PNG/GIF/WEBP uploads
    can all be stored in one optimized web format.
    """
    image.seek(0)
    image = ImageOps.exif_transpose(image)

    has_alpha = _image_has_alpha(image)

    if has_alpha:
        if image.mode != "RGBA":
            image = image.convert("RGBA")
    else:
        if image.mode != "RGB":
            image = image.convert("RGB")

    image = _resize_for_storage(image)

    return image, "WEBP", "webp", "image/webp"


def sanitize_image_upload(upload, *, field_label, max_size_bytes):
    """
    Return an optimized, sanitized WebP copy of a validated upload.

    This avoids storing the original user-supplied bytes.

    Security/privacy/performance benefits:

    - strips EXIF metadata, including possible GPS data
    - strips camera/device metadata
    - applies EXIF orientation safely
    - flattens GIF/animated uploads to the first frame
    - resizes huge camera uploads to a web-friendly size
    - re-encodes the image into a clean optimized WebP file
    """
    current_position = _remember_position(upload)

    try:
        if hasattr(upload, "seek"):
            upload.seek(0)

        with catch_warnings():
            simplefilter("error", DecompressionBombWarning)

            with Image.open(upload) as image:
                image_format = (image.format or "").upper()

                _validate_image_dimensions(
                    image,
                    field_label=field_label,
                )

                if image_format not in ALLOWED_IMAGE_FORMATS:
                    raise serializers.ValidationError(
                        _build_invalid_type_message(field_label)
                    )

                image.load()

                sanitized_image, save_format, extension, content_type = (
                    _prepare_image_for_saving(image)
                )

                output = BytesIO()
                save_kwargs = {
                    "quality": SANITIZED_WEBP_QUALITY,
                    "method": SANITIZED_WEBP_METHOD,
                }

                sanitized_image.save(output, format=save_format, **save_kwargs)

        sanitized_bytes = output.getvalue()

        if len(sanitized_bytes) > max_size_bytes:
            max_size_mb = max_size_bytes / (1024 * 1024)

            raise serializers.ValidationError(
                f"{field_label} is too large after optimizing. "
                f"Please upload an image that can be stored as {max_size_mb:.0f} MB or smaller."
            )

        sanitized_name = _build_sanitized_filename(
            getattr(upload, "name", None),
            extension,
        )

        return SimpleUploadedFile(
            sanitized_name,
            sanitized_bytes,
            content_type=content_type,
        )

    except serializers.ValidationError:
        raise

    except (DecompressionBombWarning, DecompressionBombError):
        raise serializers.ValidationError(
            f"{field_label} is too large or complex to be processed safely."
        )

    except (UnidentifiedImageError, OSError, ValueError):
        raise serializers.ValidationError(
            f"{field_label} could not be optimized. Please upload a valid image file."
        )

    finally:
        _restore_position(upload, current_position)


def validate_image_upload(upload, *, field_label, max_size_bytes):
    if upload is None:
        return upload

    content_type = getattr(upload, "content_type", None)

    if content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise serializers.ValidationError(
            _build_invalid_type_message(field_label)
        )

    file_size = getattr(upload, "size", None)

    if file_size is not None and file_size > max_size_bytes:
        max_size_mb = max_size_bytes / (1024 * 1024)

        raise serializers.ValidationError(
            f"{field_label} must be {max_size_mb:.0f} MB or smaller."
        )

    _inspect_image_bytes(upload, field_label=field_label)

    return sanitize_image_upload(
        upload,
        field_label=field_label,
        max_size_bytes=max_size_bytes,
    )


def validate_image_upload_list(uploads, *, field_label, max_count, max_size_bytes):
    uploads = uploads or []

    if len(uploads) > max_count:
        raise serializers.ValidationError(
            f"You can upload at most {max_count} {field_label.lower()}."
        )

    sanitized_uploads = []

    for upload in uploads:
        sanitized_uploads.append(
            validate_image_upload(
                upload,
                field_label=field_label,
                max_size_bytes=max_size_bytes,
            )
        )

    return sanitized_uploads
from warnings import catch_warnings, simplefilter

from PIL import Image, UnidentifiedImageError
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


def _build_invalid_type_message(field_label):
    return f"{field_label} must be a JPG, PNG, WEBP, or GIF image."


def _validate_image_bytes(upload, *, field_label):
    current_position = upload.tell() if hasattr(upload, "tell") else None

    try:
        with catch_warnings():
            simplefilter("error", DecompressionBombWarning)
            with Image.open(upload) as image:
                image.verify()

        if hasattr(upload, "seek"):
            upload.seek(0)

        with catch_warnings():
            simplefilter("error", DecompressionBombWarning)
            with Image.open(upload) as image:
                image.load()
                image_format = (image.format or "").upper()
                width, height = image.size

        if image_format not in ALLOWED_IMAGE_FORMATS:
            raise serializers.ValidationError(_build_invalid_type_message(field_label))

        total_pixels = width * height
        if width > MAX_IMAGE_WIDTH_PX or height > MAX_IMAGE_HEIGHT_PX or total_pixels > MAX_IMAGE_TOTAL_PIXELS:
            raise serializers.ValidationError(
                f"{field_label} dimensions are too large. Maximum supported size is {MAX_IMAGE_WIDTH_PX}x{MAX_IMAGE_HEIGHT_PX} pixels."
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
        if hasattr(upload, "seek"):
            upload.seek(current_position or 0)


def validate_image_upload(upload, *, field_label, max_size_bytes):
    if upload is None:
        return upload

    content_type = getattr(upload, "content_type", None)
    if content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise serializers.ValidationError(_build_invalid_type_message(field_label))

    file_size = getattr(upload, "size", None)
    if file_size is not None and file_size > max_size_bytes:
        max_size_mb = max_size_bytes / (1024 * 1024)
        raise serializers.ValidationError(
            f"{field_label} must be {max_size_mb:.0f} MB or smaller."
        )

    _validate_image_bytes(upload, field_label=field_label)

    return upload


def validate_image_upload_list(uploads, *, field_label, max_count, max_size_bytes):
    uploads = uploads or []

    if len(uploads) > max_count:
        raise serializers.ValidationError(
            f"You can upload at most {max_count} {field_label.lower()}."
        )

    for upload in uploads:
        validate_image_upload(
            upload,
            field_label=field_label,
            max_size_bytes=max_size_bytes,
        )

    return uploads

import shutil
import tempfile
from io import BytesIO
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import serializers
from rest_framework.test import APITestCase

from config.uploads import (
    MAX_BOAT_IMAGE_COUNT,
    MAX_BOAT_IMAGE_SIZE_BYTES,
    validate_image_upload,
)
from listings.models import BoatImage, BoatListing


def make_image_upload(
    *,
    name="boat.png",
    image_format="PNG",
    content_type="image/png",
    size=(16, 16),
    mode="RGB",
):
    image = Image.new(mode, size, color="white")
    output = BytesIO()
    image.save(output, format=image_format)
    output.seek(0)

    return SimpleUploadedFile(
        name,
        output.getvalue(),
        content_type=content_type,
    )


class DirectImageUploadValidationRegressionTests(TestCase):
    def test_rejects_file_larger_than_boat_image_limit_before_decoding(self):
        upload = SimpleUploadedFile(
            "huge.png",
            b"x" * (MAX_BOAT_IMAGE_SIZE_BYTES + 1),
            content_type="image/png",
        )

        with self.assertRaises(serializers.ValidationError) as context:
            validate_image_upload(
                upload,
                field_label="Boat image",
                max_size_bytes=MAX_BOAT_IMAGE_SIZE_BYTES,
            )

        self.assertIn("Boat image must be 5 MB or smaller", str(context.exception))

    def test_rejects_corrupted_image_even_with_valid_image_mime_type(self):
        upload = SimpleUploadedFile(
            "fake.jpg",
            b"this-is-not-really-a-jpeg",
            content_type="image/jpeg",
        )

        with self.assertRaises(serializers.ValidationError) as context:
            validate_image_upload(
                upload,
                field_label="Boat image",
                max_size_bytes=MAX_BOAT_IMAGE_SIZE_BYTES,
            )

        self.assertIn("valid, non-corrupted image file", str(context.exception))

    def test_rejects_valid_bmp_bytes_even_when_content_type_claims_png(self):
        upload = make_image_upload(
            name="sneaky.png",
            image_format="BMP",
            content_type="image/png",
        )

        with self.assertRaises(serializers.ValidationError) as context:
            validate_image_upload(
                upload,
                field_label="Boat image",
                max_size_bytes=MAX_BOAT_IMAGE_SIZE_BYTES,
            )

        self.assertIn("must be a JPG, PNG, WEBP, or GIF image", str(context.exception))

    @patch("config.uploads.MAX_IMAGE_WIDTH_PX", 10)
    @patch("config.uploads.MAX_IMAGE_HEIGHT_PX", 10)
    @patch("config.uploads.MAX_IMAGE_TOTAL_PIXELS", 100)
    def test_rejects_images_with_dimensions_above_safe_limits(self):
        upload = make_image_upload(
            name="too-wide.png",
            image_format="PNG",
            content_type="image/png",
            size=(16, 16),
        )

        with self.assertRaises(serializers.ValidationError) as context:
            validate_image_upload(
                upload,
                field_label="Boat image",
                max_size_bytes=MAX_BOAT_IMAGE_SIZE_BYTES,
            )

        self.assertIn("dimensions are too large", str(context.exception))

    def test_accepts_valid_image_and_returns_sanitized_copy(self):
        upload = make_image_upload(
            name="raw-camera-upload.png",
            image_format="PNG",
            content_type="image/png",
        )

        sanitized = validate_image_upload(
            upload,
            field_label="Boat image",
            max_size_bytes=MAX_BOAT_IMAGE_SIZE_BYTES,
        )

        self.assertTrue(sanitized.name.endswith("_sanitized.jpg"))
        self.assertEqual(sanitized.content_type, "image/jpeg")
        self.assertGreater(sanitized.size, 0)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class BoatListingApiUploadValidationRegressionTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        media_root = cls._overridden_settings["MEDIA_ROOT"]
        super().tearDownClass()
        shutil.rmtree(media_root, ignore_errors=True)

    def setUp(self):
        self.host = User.objects.create_user(
            username="upload-api-host",
            password="strong-pass-123",
        )
        self.client.force_authenticate(user=self.host)

    def _payload(self):
        return {
            "title": "Upload API Boat",
            "description": "A valid boat listing payload used for upload API tests.",
            "boat_type": "motorboat",
            "location_name": "Mo i Rana",
            "pickup_address": "Private Dock 7",
            "pickup_instructions": "Meet by the red warehouse.",
            "guests": "4",
            "price_per_day": "1200.00",
            "latitude": "66.312800",
            "longitude": "14.142800",
        }

    def test_create_listing_rejects_fake_image_upload_and_creates_nothing(self):
        response = self.client.post(
            reverse("boat-list-create"),
            {
                **self._payload(),
                "new_images": [
                    SimpleUploadedFile(
                        "fake.jpg",
                        b"not-really-an-image",
                        content_type="image/jpeg",
                    )
                ],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("new_images", response.json())

        self.assertFalse(
            BoatListing.objects.filter(title="Upload API Boat").exists()
        )
        self.assertEqual(BoatImage.objects.count(), 0)

    def test_create_listing_rejects_too_many_uploaded_images_before_creating_boat(self):
        response = self.client.post(
            reverse("boat-list-create"),
            {
                **self._payload(),
                "new_images": [
                    make_image_upload(name=f"boat-{index}.png")
                    for index in range(MAX_BOAT_IMAGE_COUNT + 1)
                ],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("new_images", response.json())

        self.assertFalse(
            BoatListing.objects.filter(title="Upload API Boat").exists()
        )
        self.assertEqual(BoatImage.objects.count(), 0)

    def test_create_listing_accepts_valid_image_and_stores_sanitized_boat_image(self):
        response = self.client.post(
            reverse("boat-list-create"),
            {
                **self._payload(),
                "new_images": [
                    make_image_upload(
                        name="raw-upload.png",
                        image_format="PNG",
                        content_type="image/png",
                    )
                ],
                "cover_index": "0",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 201, response.json())

        boat = BoatListing.objects.get(title="Upload API Boat")
        image = boat.images.get()

        self.assertTrue(image.image.name.endswith("_sanitized.jpg"))
        self.assertTrue(image.is_cover)
        self.assertEqual(BoatImage.objects.count(), 1)

    def test_update_listing_rejects_fake_new_image_and_keeps_existing_listing_unchanged(self):
        boat = BoatListing.objects.create(
            host=self.host,
            title="Existing Upload Boat",
            description="A listing that should stay unchanged after a bad upload.",
            boat_type="motorboat",
            location_name="Mo i Rana",
            pickup_address="Private Dock 9",
            pickup_instructions="Original instructions.",
            guests=4,
            price_per_day="1200.00",
            latitude="66.312800",
            longitude="14.142800",
        )

        response = self.client.patch(
            reverse("my-boat-update", args=[boat.id]),
            {
                "title": "Changed By Bad Upload",
                "new_images": [
                    SimpleUploadedFile(
                        "fake.png",
                        b"not-a-real-png",
                        content_type="image/png",
                    )
                ],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("new_images", response.json())

        boat.refresh_from_db()

        self.assertEqual(boat.title, "Existing Upload Boat")
        self.assertEqual(boat.images.count(), 0)
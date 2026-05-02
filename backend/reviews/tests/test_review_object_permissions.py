from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from bookings.models import Booking
from listings.models import BoatListing
from reviews.models import Review


class ReviewObjectLevelPermissionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username="review-obj-host",
            password="strong-pass-123",
        )
        self.renter = User.objects.create_user(
            username="review-obj-renter",
            password="strong-pass-123",
        )
        self.other_host = User.objects.create_user(
            username="review-obj-other-host",
            password="strong-pass-123",
        )
        self.other_renter = User.objects.create_user(
            username="review-obj-other-renter",
            password="strong-pass-123",
        )
        self.intruder = User.objects.create_user(
            username="review-obj-intruder",
            password="strong-pass-123",
        )

        self.boat = BoatListing.objects.create(
            host=self.host,
            title="Review Object Boat",
            description="Boat used for review permission tests.",
            boat_type="motorboat",
            location_name="Mo i Rana",
            guests=4,
            price_per_day=Decimal("1000.00"),
        )

        self.other_boat = BoatListing.objects.create(
            host=self.other_host,
            title="Other Review Object Boat",
            description="Other boat used for review permission tests.",
            boat_type="sailboat",
            location_name="Bodø",
            guests=5,
            price_per_day=Decimal("1200.00"),
        )

        today = timezone.localdate()

        self.booking = Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=today - timedelta(days=5),
            end_date=today - timedelta(days=3),
            total_price=Decimal("2000.00"),
            status="confirmed",
        )

        self.other_booking = Booking.objects.create(
            boat=self.other_boat,
            renter=self.other_renter,
            start_date=today - timedelta(days=5),
            end_date=today - timedelta(days=3),
            total_price=Decimal("2400.00"),
            status="confirmed",
        )

    def test_intruder_cannot_review_booking_they_did_not_participate_in(self):
        self.client.force_authenticate(user=self.intruder)

        response = self.client.post(
            reverse("create-review"),
            {
                "booking": self.booking.id,
                "review_type": Review.REVIEW_TYPE_USER,
                "rating": 5,
                "comment": "Trying to review a private booking.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("booking", response.json())
        self.assertEqual(Review.objects.count(), 0)

    def test_host_cannot_leave_boat_review_for_own_boat(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.post(
            reverse("create-review"),
            {
                "booking": self.booking.id,
                "review_type": Review.REVIEW_TYPE_BOAT,
                "rating": 5,
                "comment": "Trying to review my own boat.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("review_type", response.json())
        self.assertEqual(Review.objects.count(), 0)

    def test_renter_can_review_boat_but_cannot_override_reviewer_boat_or_role(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse("create-review"),
            {
                "booking": self.booking.id,
                "review_type": Review.REVIEW_TYPE_BOAT,
                "rating": 5,
                "comment": "Great trip.",
                "boat": self.other_boat.id,
                "reviewer": self.intruder.id,
                "reviewed_user": self.intruder.id,
                "role": Review.ROLE_HOST,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        review = Review.objects.get()

        self.assertEqual(review.booking, self.booking)
        self.assertEqual(review.boat, self.boat)
        self.assertEqual(review.reviewer, self.renter)
        self.assertIsNone(review.reviewed_user)
        self.assertEqual(review.review_type, Review.REVIEW_TYPE_BOAT)
        self.assertEqual(review.role, Review.ROLE_BOAT)

    def test_reviewable_bookings_only_returns_bookings_for_authenticated_user(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.get(reverse("my-reviewable-bookings"))

        self.assertEqual(response.status_code, 200)

        returned_ids = [item["booking_id"] for item in response.json()["results"]]

        self.assertIn(self.booking.id, returned_ids)
        self.assertNotIn(self.other_booking.id, returned_ids)

    def test_duplicate_user_review_same_direction_is_rejected(self):
        Review.objects.create(
            booking=self.booking,
            boat=self.boat,
            reviewer=self.renter,
            reviewed_user=self.host,
            review_type=Review.REVIEW_TYPE_USER,
            role=Review.ROLE_HOST,
            rating=5,
            comment="Already reviewed.",
        )

        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse("create-review"),
            {
                "booking": self.booking.id,
                "review_type": Review.REVIEW_TYPE_USER,
                "rating": 4,
                "comment": "Trying to review twice.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("booking", response.json())
        self.assertEqual(Review.objects.count(), 1)
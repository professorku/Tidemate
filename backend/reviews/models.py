from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q

from bookings.models import Booking
from listings.models import BoatListing


MAX_REVIEW_COMMENT_LENGTH = 1000


class Review(models.Model):
    REVIEW_TYPE_BOAT = 'boat'
    REVIEW_TYPE_USER = 'user'

    ROLE_BOAT = 'boat'
    ROLE_HOST = 'host'
    ROLE_RENTER = 'renter'

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    boat = models.ForeignKey(
        BoatListing,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_written',
    )
    reviewed_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews_received',
        null=True,
        blank=True,
    )

    review_type = models.CharField(
        max_length=20,
        choices=[
            (REVIEW_TYPE_BOAT, 'Boat'),
            (REVIEW_TYPE_USER, 'User'),
        ],
        default=REVIEW_TYPE_USER,
    )

    role = models.CharField(
        max_length=20,
        choices=[
            (ROLE_BOAT, 'Boat'),
            (ROLE_HOST, 'Host'),
            (ROLE_RENTER, 'Renter'),
        ],
        null=True,
        blank=True,
    )

    rating = models.PositiveSmallIntegerField()
    comment = models.CharField(max_length=MAX_REVIEW_COMMENT_LENGTH, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

        constraints = [
            models.UniqueConstraint(
                fields=['booking', 'reviewer', 'boat', 'review_type'],
                condition=Q(review_type='boat'),
                name='unique_boat_review_per_booking',
            ),
            models.UniqueConstraint(
                fields=['booking', 'reviewer', 'reviewed_user', 'review_type'],
                condition=Q(review_type='user'),
                name='unique_user_review_per_direction_per_booking',
            ),
        ]

    def __str__(self):
        if self.review_type == self.REVIEW_TYPE_BOAT:
            return f"{self.reviewer.username} → boat:{self.boat_id} ({self.booking_id})"

        reviewed_username = self.reviewed_user.username if self.reviewed_user else 'unknown'
        return f"{self.reviewer.username} → {reviewed_username} ({self.booking_id})"
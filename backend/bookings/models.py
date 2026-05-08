from decimal import Decimal
import secrets

from django.contrib.auth.models import User
from django.db import models
from django.db.models import F, Q

from listings.models import BoatListing


MAX_BOOKING_CANCELLATION_REASON_LENGTH = 500
MIN_BOOKING_TOTAL_PRICE = Decimal('0.01')

BOOKING_PUBLIC_ID_PREFIX = 'TM-'
BOOKING_PUBLIC_ID_RANDOM_LENGTH = 8
BOOKING_PUBLIC_ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'


def generate_booking_public_id():
    random_part = ''.join(
        secrets.choice(BOOKING_PUBLIC_ID_ALPHABET)
        for _ in range(BOOKING_PUBLIC_ID_RANDOM_LENGTH)
    )
    return f'{BOOKING_PUBLIC_ID_PREFIX}{random_part}'


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('awaiting_payment', 'Awaiting payment'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    CANCELLED_BY_CHOICES = [
        ('renter', 'Renter'),
        ('host', 'Host'),
    ]

    public_id = models.CharField(
        max_length=11,
        unique=True,
        editable=False,
        default=generate_booking_public_id,
    )

    boat = models.ForeignKey(
        BoatListing,
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    renter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField(blank=True, null=True, db_index=True)

    cancellation_reason = models.CharField(
        max_length=MAX_BOOKING_CANCELLATION_REASON_LENGTH,
        blank=True,
    )
    cancelled_by = models.CharField(
        max_length=20,
        choices=CANCELLED_BY_CHOICES,
        blank=True,
    )
    cancelled_at = models.DateTimeField(blank=True, null=True)

    archived_by_renter_at = models.DateTimeField(blank=True, null=True, db_index=True)
    archived_by_host_at = models.DateTimeField(blank=True, null=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['renter', 'archived_by_renter_at', '-created_at', '-id'], name='booking_renter_visible_idx'),
            models.Index(fields=['boat', 'archived_by_host_at', 'status', '-created_at', '-id'], name='booking_boat_host_status_idx'),
            models.Index(fields=['boat', 'status', 'start_date', 'end_date'], name='booking_boat_status_dates_idx'),
            models.Index(fields=['status', 'expires_at'], name='booking_status_expires_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(end_date__gt=F('start_date')),
                name='booking_end_date_after_start_date',
            ),
            models.CheckConstraint(
                condition=Q(total_price__gte=MIN_BOOKING_TOTAL_PRICE),
                name='booking_total_price_positive',
            ),
        ]

    def __str__(self):
        return f'{self.public_id} · {self.boat.title} booking by {self.renter.username}'
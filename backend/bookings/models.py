from django.contrib.auth.models import User
from django.db import models

from listings.models import BoatListing


MAX_BOOKING_CANCELLATION_REASON_LENGTH = 500


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    CANCELLED_BY_CHOICES = [
        ('renter', 'Renter'),
        ('host', 'Host'),
    ]

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

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.boat.title} booking by {self.renter.username}'
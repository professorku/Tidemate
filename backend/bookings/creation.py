from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from config.booking_policy import MAX_BOOKING_DURATION_DAYS
from listings.models import BoatListing

from .expiry import active_booking_filter, get_pending_booking_expiry_at
from .models import Booking


def get_booking_duration_days(*, start_date, end_date):
    """
    Booking dates are treated as a half-open range:

        [start_date, end_date)

    start_date is the pickup date.
    end_date is the return/check-out date.

    Example:
        May 1 -> May 2 = 1 rental day
        May 1 -> May 3 = 2 rental days
    """
    return (end_date - start_date).days


def validate_booking_duration(*, start_date, end_date):
    duration_days = get_booking_duration_days(
        start_date=start_date,
        end_date=end_date,
    )

    if duration_days <= 0:
        raise serializers.ValidationError({
            'end_date': ['Return date must be after the pickup date.']
        })

    if duration_days > MAX_BOOKING_DURATION_DAYS:
        raise serializers.ValidationError({
            'end_date': [
                f'Bookings cannot be longer than {MAX_BOOKING_DURATION_DAYS} days.'
            ]
        })

    return duration_days


def _get_overlapping_bookings(*, boat, start_date, end_date, now=None):
    """
    Half-open overlap check.

    Two ranges overlap when:

        existing.start_date < new.end_date
        existing.end_date > new.start_date

    This allows back-to-back bookings where one booking's return date is
    the next booking's pickup date.
    """
    return Booking.objects.filter(
        active_booking_filter(now=now),
        boat=boat,
        start_date__lt=end_date,
        end_date__gt=start_date,
    )


@transaction.atomic
def create_pending_booking(*, boat, renter, start_date, end_date):
    current_time = timezone.now()

    duration_days = validate_booking_duration(
        start_date=start_date,
        end_date=end_date,
    )

    locked_boat = BoatListing.objects.select_for_update().get(pk=boat.pk)

    if _get_overlapping_bookings(
        boat=locked_boat,
        start_date=start_date,
        end_date=end_date,
        now=current_time,
    ).exists():
        raise serializers.ValidationError(
            'These dates are not available because they overlap with another active booking request or confirmed booking.'
        )

    total_price = locked_boat.price_per_day * duration_days

    return Booking.objects.create(
        boat=locked_boat,
        renter=renter,
        start_date=start_date,
        end_date=end_date,
        total_price=total_price,
        expires_at=get_pending_booking_expiry_at(now=current_time),
    )
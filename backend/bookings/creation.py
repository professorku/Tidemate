from django.db import transaction
from rest_framework import serializers

from listings.models import BoatListing

from .models import Booking

ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed']


def _get_overlapping_bookings(*, boat, start_date, end_date):
    return Booking.objects.filter(
        boat=boat,
        status__in=ACTIVE_BOOKING_STATUSES,
        start_date__lte=end_date,
        end_date__gte=start_date,
    )


@transaction.atomic
def create_pending_booking(*, boat, renter, start_date, end_date):
    locked_boat = BoatListing.objects.select_for_update().get(pk=boat.pk)

    if _get_overlapping_bookings(
        boat=locked_boat,
        start_date=start_date,
        end_date=end_date,
    ).exists():
        raise serializers.ValidationError(
            'These dates are not available because they overlap with another booking.'
        )

    days = (end_date - start_date).days + 1
    total_price = locked_boat.price_per_day * days

    return Booking.objects.create(
        boat=locked_boat,
        renter=renter,
        start_date=start_date,
        end_date=end_date,
        total_price=total_price,
    )

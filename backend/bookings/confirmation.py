from django.db import transaction
from django.utils import timezone

from listings.models import BoatListing

from .expiry import (
    EXPIRED_PENDING_ERROR_MESSAGE,
    active_booking_filter,
    active_pending_booking_filter,
    expire_booking_if_needed,
)
from .models import Booking


def _get_overlapping_bookings(*, boat, start_date, end_date, now=None):
    return Booking.objects.filter(
        active_booking_filter(now=now),
        boat=boat,
        start_date__lte=end_date,
        end_date__gte=start_date,
    )


@transaction.atomic
def confirm_pending_booking(*, booking):
    current_time = timezone.now()

    locked_booking = (
        Booking.objects.select_related('boat', 'renter')
        .select_for_update()
        .get(pk=booking.pk)
    )

    if locked_booking.status != 'pending':
        raise ValueError('Only pending bookings can be confirmed.')

    if expire_booking_if_needed(locked_booking, now=current_time):
        raise ValueError(EXPIRED_PENDING_ERROR_MESSAGE)

    locked_boat = BoatListing.objects.select_for_update().get(pk=locked_booking.boat_id)

    overlapping_confirmed_exists = (
        _get_overlapping_bookings(
            boat=locked_boat,
            start_date=locked_booking.start_date,
            end_date=locked_booking.end_date,
            now=current_time,
        )
        .filter(status='confirmed')
        .exclude(pk=locked_booking.pk)
        .exists()
    )

    if overlapping_confirmed_exists:
        raise ValueError(
            'These dates are no longer available because another overlapping booking was already confirmed.'
        )

    locked_booking.status = 'confirmed'
    locked_booking.expires_at = None
    locked_booking.save(update_fields=['status', 'expires_at'])

    overlapping_pending = list(
        Booking.objects.filter(
            active_pending_booking_filter(now=current_time),
            boat=locked_boat,
            start_date__lte=locked_booking.end_date,
            end_date__gte=locked_booking.start_date,
        )
        .exclude(pk=locked_booking.pk)
        .select_related(
            'boat',
            'boat__host',
            'renter',
            'renter__profile',
        )
    )

    cancelled_at = timezone.now()
    cancellation_reason = 'Another overlapping booking was confirmed for these dates.'

    for other_booking in overlapping_pending:
        other_booking.status = 'cancelled'
        other_booking.cancelled_by = 'host'
        other_booking.cancelled_at = cancelled_at
        other_booking.cancellation_reason = cancellation_reason
        other_booking.save(
            update_fields=[
                'status',
                'cancelled_by',
                'cancelled_at',
                'cancellation_reason',
            ]
        )

    return locked_booking, overlapping_pending
from django.db import transaction
from django.utils import timezone

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
def confirm_pending_booking(*, booking):
    locked_booking = Booking.objects.select_related('boat', 'renter').select_for_update().get(pk=booking.pk)

    if locked_booking.status != 'pending':
        raise ValueError('Only pending bookings can be confirmed.')

    locked_boat = BoatListing.objects.select_for_update().get(pk=locked_booking.boat_id)

    overlapping_confirmed_exists = _get_overlapping_bookings(
        boat=locked_boat,
        start_date=locked_booking.start_date,
        end_date=locked_booking.end_date,
    ).filter(status='confirmed').exclude(pk=locked_booking.pk).exists()

    if overlapping_confirmed_exists:
        raise ValueError('These dates are no longer available because another overlapping booking was already confirmed.')

    locked_booking.status = 'confirmed'
    locked_booking.save(update_fields=['status'])

    overlapping_pending = _get_overlapping_bookings(
        boat=locked_boat,
        start_date=locked_booking.start_date,
        end_date=locked_booking.end_date,
    ).filter(status='pending').exclude(pk=locked_booking.pk).select_related(
        'boat',
        'boat__host',
        'renter',
        'renter__profile',
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

    return locked_booking, list(overlapping_pending)

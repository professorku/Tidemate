from datetime import datetime

from django.utils import timezone

from config.booking_policy import BOOKING_END_TIME, BOOKING_START_TIME


def booking_pickup_datetime(booking):
    naive_datetime = datetime.combine(booking.start_date, BOOKING_START_TIME)
    return timezone.make_aware(naive_datetime, timezone.get_current_timezone())


def booking_return_datetime(booking):
    naive_datetime = datetime.combine(booking.end_date, BOOKING_END_TIME)
    return timezone.make_aware(naive_datetime, timezone.get_current_timezone())


def get_booking_lifecycle_stage(booking, *, now=None):
    current_time = now or timezone.now()

    if booking.status == 'cancelled':
        return 'cancelled'

    if booking.status == 'pending':
        return 'pending'

    pickup_datetime = booking_pickup_datetime(booking)
    return_datetime = booking_return_datetime(booking)

    if current_time < pickup_datetime:
        return 'upcoming'

    if pickup_datetime <= current_time <= return_datetime:
        return 'active'

    return 'completed'


def can_cancel_booking(booking, *, now=None):
    current_time = now or timezone.now()

    if booking.status == 'cancelled':
        return False

    if booking.status == 'pending':
        return True

    if booking.status != 'confirmed':
        return False

    return current_time < booking_pickup_datetime(booking)
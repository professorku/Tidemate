from datetime import datetime, time

from django.utils import timezone


BOOKING_RETURN_TIME = time(hour=12, minute=0)


def get_booking_return_datetime(booking):
    naive_datetime = datetime.combine(booking.end_date, BOOKING_RETURN_TIME)
    return timezone.make_aware(naive_datetime, timezone.get_current_timezone())

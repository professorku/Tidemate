from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from config.booking_policy import PENDING_BOOKING_EXPIRY_MINUTES

from .models import Booking


EXPIRED_PENDING_CANCELLATION_REASON = (
    'Booking request expired because it was not confirmed in time.'
)
EXPIRED_PENDING_ERROR_MESSAGE = (
    'This booking request has expired because it was not confirmed in time.'
)


def get_pending_booking_expiry_at(*, now=None):
    current_time = now or timezone.now()
    return current_time + timedelta(minutes=PENDING_BOOKING_EXPIRY_MINUTES)


def active_booking_filter(*, now=None):
    current_time = now or timezone.now()

    return Q(status='confirmed') | (
        Q(status='pending')
        & (Q(expires_at__isnull=True) | Q(expires_at__gt=current_time))
    )


def active_pending_booking_filter(*, now=None):
    current_time = now or timezone.now()

    return Q(status='pending') & (
        Q(expires_at__isnull=True) | Q(expires_at__gt=current_time)
    )


def expired_pending_booking_filter(*, now=None):
    current_time = now or timezone.now()
    fallback_cutoff = current_time - timedelta(minutes=PENDING_BOOKING_EXPIRY_MINUTES)

    return Q(status='pending') & (
        Q(expires_at__lte=current_time)
        | Q(expires_at__isnull=True, created_at__lte=fallback_cutoff)
    )


def pending_booking_is_expired(booking, *, now=None):
    if booking.status != 'pending':
        return False

    current_time = now or timezone.now()

    if booking.expires_at:
        return booking.expires_at <= current_time

    if booking.created_at:
        return (
            booking.created_at + timedelta(minutes=PENDING_BOOKING_EXPIRY_MINUTES)
            <= current_time
        )

    return False


def expire_pending_bookings(*, now=None, queryset=None):
    current_time = now or timezone.now()
    base_queryset = queryset if queryset is not None else Booking.objects.all()

    return base_queryset.filter(expired_pending_booking_filter(now=current_time)).update(
        status='cancelled',
        cancelled_by='',
        cancelled_at=current_time,
        cancellation_reason=EXPIRED_PENDING_CANCELLATION_REASON,
    )


def expire_booking_if_needed(booking, *, now=None):
    current_time = now or timezone.now()

    if not pending_booking_is_expired(booking, now=current_time):
        return False

    booking.status = 'cancelled'
    booking.cancelled_by = ''
    booking.cancelled_at = current_time
    booking.cancellation_reason = EXPIRED_PENDING_CANCELLATION_REASON
    booking.save(
        update_fields=[
            'status',
            'cancelled_by',
            'cancelled_at',
            'cancellation_reason',
        ]
    )
    return True

def expire_visible_pending_bookings_for_user(user, *, now=None):
    if not user or not user.is_authenticated:
        return 0

    return expire_pending_bookings(
        now=now,
        queryset=Booking.objects.filter(
            Q(renter=user) | Q(boat__host=user)
        ),
    )
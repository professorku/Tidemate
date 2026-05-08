from django.db import transaction
from django.utils import timezone

from chat.models import Conversation
from notifications.models import Notification

from .confirmation import confirm_pending_booking
from .lifecycle import can_cancel_booking, get_booking_lifecycle_stage
from .models import Booking
from .serializers import BookingCancelSerializer


def get_user_display_name(user, fallback='User'):
    if not user:
        return fallback

    profile = getattr(user, 'profile', None)
    display_name = getattr(profile, 'display_name', '') if profile else ''

    return (display_name or user.username or fallback).strip()


@transaction.atomic
def create_booking(*, serializer):
    booking = serializer.save()

    Conversation.objects.get_or_create(
        booking=booking,
        defaults={
            'host': booking.boat.host,
            'renter': booking.renter,
        },
    )

    renter_name = get_user_display_name(booking.renter, fallback='Renter')

    Notification.objects.create(
        user=booking.boat.host,
        message=(
            f'New booking request for "{booking.boat.title}" '
            f'from {renter_name}.'
        ),
        target_url='/host-bookings',
    )

    return booking


@transaction.atomic
def confirm_booking(*, booking):
    booking, overlapping_pending = confirm_pending_booking(booking=booking)

    for other_booking in overlapping_pending:
        Notification.objects.create(
            user=other_booking.renter,
            message=(
                f'Your booking request for "{other_booking.boat.title}" was cancelled '
                f'because another overlapping booking was confirmed.'
            ),
            target_url='/my-bookings',
        )

    Notification.objects.create(
        user=booking.renter,
        message=f'Your booking for "{booking.boat.title}" has been confirmed.',
        target_url='/my-bookings',
    )

    return booking


@transaction.atomic
def cancel_booking(*, booking, actor, data):
    booking = (
        Booking.objects.select_for_update(of=('self',))
        .select_related(
            'boat',
            'boat__host',
            'renter',
        )
        .get(pk=booking.pk)
    )

    is_renter = booking.renter == actor
    is_host = booking.boat.host == actor

    if not is_renter and not is_host:
        raise PermissionError('Not allowed.')

    if booking.status == 'cancelled':
        raise ValueError('This booking is already cancelled.')

    if not can_cancel_booking(booking):
        raise ValueError(
            'This booking can no longer be cancelled because the trip has already started or finished.'
        )

    serializer = BookingCancelSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    reason = serializer.validated_data.get('reason', '')

    booking.status = 'cancelled'
    booking.cancelled_by = 'renter' if is_renter else 'host'
    booking.cancelled_at = timezone.now()
    booking.cancellation_reason = reason
    booking.save(
        update_fields=[
            'status',
            'cancelled_by',
            'cancelled_at',
            'cancellation_reason',
        ]
    )

    if is_renter:
        renter_name = get_user_display_name(booking.renter, fallback='The renter')

        Notification.objects.create(
            user=booking.boat.host,
            message=(
                f'{renter_name} cancelled the booking for '
                f'"{booking.boat.title}".'
            ),
            target_url='/host-bookings',
        )
    else:
        Notification.objects.create(
            user=booking.renter,
            message=f'The host cancelled your booking for "{booking.boat.title}".',
            target_url='/my-bookings',
        )

    return booking


@transaction.atomic
def delete_booking(*, booking, actor):
    booking = (
        Booking.objects.select_related('boat', 'boat__host', 'renter')
        .select_for_update()
        .get(pk=booking.pk)
    )

    is_renter = booking.renter == actor
    is_host = booking.boat.host == actor

    if not is_renter and not is_host:
        raise PermissionError('Not allowed.')

    lifecycle_stage = get_booking_lifecycle_stage(booking)

    can_delete = (
        booking.status == 'cancelled'
        or lifecycle_stage == 'completed'
    )

    if not can_delete:
        raise ValueError('Only cancelled or completed bookings can be deleted.')

    archive_field = 'archived_by_renter_at' if is_renter else 'archived_by_host_at'

    if getattr(booking, archive_field):
        raise ValueError('This booking has already been deleted from your account.')

    setattr(booking, archive_field, timezone.now())
    booking.save(update_fields=[archive_field])
from django.db import IntegrityError, transaction
from django.utils import timezone

from bookings.lifecycle import get_booking_lifecycle_stage
from notifications.services import create_and_push_notification
from users.models import Profile

from .models import Conversation


def get_or_create_profile(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def get_conversation_archive_field_for_user(*, conversation, user):
    if conversation.host_id == user.id:
        return 'archived_by_host_at'

    if conversation.renter_id == user.id:
        return 'archived_by_renter_at'

    raise PermissionError('Not allowed to access this conversation.')


def conversation_is_archived_for_user(*, conversation, user):
    archive_field = get_conversation_archive_field_for_user(
        conversation=conversation,
        user=user,
    )
    return getattr(conversation, archive_field) is not None


def archive_conversation_for_user(*, conversation, user):
    archive_field = get_conversation_archive_field_for_user(
        conversation=conversation,
        user=user,
    )

    if getattr(conversation, archive_field):
        raise ValueError('This conversation has already been deleted from your account.')

    setattr(conversation, archive_field, timezone.now())
    conversation.save(update_fields=[archive_field])


def unarchive_conversation_for_user(*, conversation, user):
    archive_field = get_conversation_archive_field_for_user(
        conversation=conversation,
        user=user,
    )

    if getattr(conversation, archive_field) is None:
        return False

    setattr(conversation, archive_field, None)
    conversation.save(update_fields=[archive_field])
    return True


def ensure_users_can_start_direct_conversation(*, actor, target_user):
    if target_user == actor:
        raise ValueError('You cannot start a conversation with yourself.')

    my_profile = get_or_create_profile(actor)
    target_profile = get_or_create_profile(target_user)

    if my_profile.blocked_users.filter(id=target_user.id).exists():
        raise PermissionError('Unblock this user before messaging them.')

    if target_profile.blocked_users.filter(id=actor.id).exists():
        raise PermissionError('You cannot message this user.')


def ensure_user_can_access_conversation(*, conversation, user):
    get_conversation_archive_field_for_user(
        conversation=conversation,
        user=user,
    )

    if conversation_is_archived_for_user(conversation=conversation, user=user):
        raise PermissionError('Conversation not found.')

    host_profile = get_or_create_profile(conversation.host)
    renter_profile = get_or_create_profile(conversation.renter)

    host_has_blocked_renter = host_profile.blocked_users.filter(
        id=conversation.renter.id
    ).exists()
    renter_has_blocked_host = renter_profile.blocked_users.filter(
        id=conversation.host.id
    ).exists()

    if user == conversation.host and renter_has_blocked_host:
        raise PermissionError('You cannot access this conversation.')

    if user == conversation.renter and host_has_blocked_renter:
        raise PermissionError('You cannot access this conversation.')


@transaction.atomic
def start_direct_conversation(*, actor, target_user, existing_conversation=None):
    ensure_users_can_start_direct_conversation(actor=actor, target_user=target_user)

    if existing_conversation:
        unarchive_conversation_for_user(
            conversation=existing_conversation,
            user=actor,
        )
        return existing_conversation, False

    try:
        conversation = Conversation.objects.create(
            host=target_user,
            renter=actor,
            conversation_type='direct',
        )
    except IntegrityError:
        conversation = Conversation.objects.get(
            conversation_type='direct',
            direct_user_low_id=min(actor.id, target_user.id),
            direct_user_high_id=max(actor.id, target_user.id),
        )
        unarchive_conversation_for_user(
            conversation=conversation,
            user=actor,
        )
        return conversation, False

    create_and_push_notification(
        user=target_user,
        message=f'{actor.username} started a direct conversation with you.',
        target_url=f'/messages/{conversation.id}',
    )

    return conversation, True


@transaction.atomic
def send_message(*, conversation, sender, serializer):
    ensure_user_can_access_conversation(conversation=conversation, user=sender)

    message = serializer.save(
        sender=sender,
        conversation=conversation,
    )

    recipient = (
        conversation.renter
        if sender == conversation.host
        else conversation.host
    )

    unarchive_conversation_for_user(
        conversation=conversation,
        user=recipient,
    )

    preview_text = (message.text or '').strip()
    if len(preview_text) > 80:
        preview_text = preview_text[:80].rstrip() + '…'

    if conversation.booking and conversation.booking.boat:
        notification_text = (
            f'New message about "{conversation.booking.boat.title}" '
            f'from {sender.username}: {preview_text}'
        )
    else:
        notification_text = f'New message from {sender.username}: {preview_text}'

    create_and_push_notification(
        user=recipient,
        message=notification_text,
        target_url=f'/messages/{conversation.id}',
    )

    return message


@transaction.atomic
def delete_conversation(*, conversation, actor):
    ensure_user_can_access_conversation(conversation=conversation, user=actor)

    if conversation.conversation_type == 'booking' and conversation.booking:
        lifecycle_stage = get_booking_lifecycle_stage(conversation.booking)

        can_delete = (
            conversation.booking.status == 'cancelled'
            or lifecycle_stage == 'completed'
        )

        if not can_delete:
            raise ValueError(
                'Booking conversations can only be deleted when the booking is cancelled or completed.'
            )

    archive_conversation_for_user(
        conversation=conversation,
        user=actor,
    )


@transaction.atomic
def delete_message(*, message, actor):
    ensure_user_can_access_conversation(
        conversation=message.conversation,
        user=actor,
    )

    if message.sender != actor:
        raise PermissionError('You can only delete your own messages.')

    if message.is_deleted:
        raise ValueError('Message is already deleted.')

    message.text = 'This message was deleted.'
    message.is_deleted = True
    message.deleted_at = timezone.now()
    message.save(update_fields=['text', 'is_deleted', 'deleted_at'])

    return message
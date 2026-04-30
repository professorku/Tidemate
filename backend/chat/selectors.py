from django.db.models import Count, F, OuterRef, Q, Subquery, TextField, Value
from django.db.models.functions import Coalesce

from bookings.models import Booking
from listings.models import BoatListing

from .models import Conversation, Message


def conversation_base_queryset():
    return Conversation.objects.select_related(
        'booking',
        'booking__boat',
        'host',
        'host__profile',
        'renter',
        'renter__profile',
    )


def conversation_visible_to_user_filter(user):
    return (
        Q(host=user, archived_by_host_at__isnull=True)
        | Q(renter=user, archived_by_renter_at__isnull=True)
    )


def conversation_blocked_for_user_filter(user):
    return (
        Q(host=user, host__profile__blocked_users=F('renter_id'))
        | Q(host=user, renter__profile__blocked_users=user)
        | Q(renter=user, renter__profile__blocked_users=F('host_id'))
        | Q(renter=user, host__profile__blocked_users=user)
    )


def conversation_accessible_to_user_filter(user):
    return conversation_visible_to_user_filter(user) & ~conversation_blocked_for_user_filter(user)


def annotate_conversation_metrics(queryset, *, viewer=None):
    latest_message_queryset = Message.objects.filter(
        conversation=OuterRef('pk')
    ).order_by('-created_at')

    annotated = queryset.annotate(
        latest_message_text=Coalesce(
            Subquery(latest_message_queryset.values('text')[:1]),
            Value('', output_field=TextField()),
            output_field=TextField(),
        ),
        latest_message_at=Coalesce(
            Subquery(latest_message_queryset.values('created_at')[:1]),
            F('created_at'),
        ),
        message_count=Count('messages', distinct=True),
    )

    if viewer and getattr(viewer, 'is_authenticated', False):
        annotated = annotated.annotate(
            unread_count=Count(
                'messages',
                filter=Q(messages__is_read=False) & ~Q(messages__sender=viewer),
                distinct=True,
            )
        )
    else:
        annotated = annotated.annotate(
            unread_count=Count('messages', filter=Q(messages__is_read=False), distinct=True)
        )

    return annotated


def get_user_conversations(user):
    return (
        annotate_conversation_metrics(
            conversation_base_queryset().filter(conversation_accessible_to_user_filter(user)),
            viewer=user,
        )
        .distinct()
        .order_by('-latest_message_at', '-created_at', '-id')
    )


def get_user_conversation_counts(user):
    queryset = conversation_base_queryset().filter(conversation_accessible_to_user_filter(user))

    return queryset.aggregate(
        all_count=Count('id', distinct=True),
        booking_count=Count('id', filter=Q(conversation_type='booking'), distinct=True),
        direct_count=Count('id', filter=Q(conversation_type='direct'), distinct=True),
        unread_count=Count(
            'id',
            filter=Q(messages__is_read=False) & ~Q(messages__sender=user),
            distinct=True,
        ),
    )


def get_direct_conversation_between_users(user_a, user_b):
    low_id, high_id = sorted([user_a.id, user_b.id])

    return (
        conversation_base_queryset()
        .filter(
            conversation_type='direct',
            direct_user_low_id=low_id,
            direct_user_high_id=high_id,
        )
        .first()
    )


def get_visible_conversation_for_user(user, conversation_id):
    return (
        conversation_base_queryset()
        .filter(
            Q(id=conversation_id),
            conversation_accessible_to_user_filter(user),
        )
        .first()
    )


def get_conversation_messages(conversation):
    return conversation.messages.select_related('sender').order_by('-created_at', '-id')


def mark_messages_as_read_for_viewer(conversation, viewer):
    return (
        conversation.messages.filter(is_read=False)
        .exclude(sender=viewer)
        .update(is_read=True)
    )


def get_target_user_by_id(user_id):
    from django.contrib.auth.models import User

    if not user_id:
        return None

    try:
        return User.objects.get(pk=user_id)
    except (User.DoesNotExist, TypeError, ValueError):
        return None


def get_boat_listing_by_id(boat_id):
    if not boat_id:
        return None

    try:
        return (
            BoatListing.objects
            .select_related('host', 'host__profile')
            .filter(pk=boat_id)
            .first()
        )
    except (TypeError, ValueError):
        return None


def users_have_booking_relationship(user_a, user_b):
 
    if not user_a or not user_b:
        return False

    return Booking.objects.filter(
        (
            Q(renter=user_a, boat__host=user_b)
            | Q(renter=user_b, boat__host=user_a)
        )
    ).exists()


def get_message_with_conversation(message_id):
    return (
        Message.objects.select_related(
            'conversation',
            'conversation__booking',
            'conversation__host',
            'conversation__renter',
            'sender',
        )
        .filter(pk=message_id)
        .first()
    )
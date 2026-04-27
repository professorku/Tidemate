from django.db import transaction

from .device_tracking import revoke_all_device_sessions_for_user
from .selectors import get_or_create_profile_for_user


@transaction.atomic
def update_my_profile(*, user, data, serializer_class, request):
    profile = get_or_create_profile_for_user(user)

    serializer = serializer_class(
        profile,
        data=data,
        partial=True,
        context={'request': request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return profile


@transaction.atomic
def toggle_crewmate_for_user(*, actor, target_user):
    if actor.id == target_user.id:
        raise ValueError('You cannot add yourself to your own crew.')

    my_profile = get_or_create_profile_for_user(actor)
    target_profile = get_or_create_profile_for_user(target_user)

    if my_profile.blocked_users.filter(id=target_user.id).exists():
        raise ValueError('Unblock this user before adding them to your crew.')

    if target_profile.blocked_users.filter(id=actor.id).exists():
        raise PermissionError('You cannot add this user because they have blocked you.')

    if my_profile.contacts.filter(id=target_user.id).exists():
        my_profile.contacts.remove(target_user)
        return {
            'is_crewmate': False,
            'detail': 'Removed from your crew.',
        }

    my_profile.contacts.add(target_user)
    return {
        'is_crewmate': True,
        'detail': 'Added to your crew.',
    }


@transaction.atomic
def toggle_block_for_user(*, actor, target_user):
    if actor.id == target_user.id:
        raise ValueError('You cannot block yourself.')

    my_profile = get_or_create_profile_for_user(actor)

    if my_profile.blocked_users.filter(id=target_user.id).exists():
        my_profile.blocked_users.remove(target_user)
        return {
            'is_blocked': False,
            'detail': 'User unblocked.',
        }

    my_profile.blocked_users.add(target_user)
    my_profile.contacts.remove(target_user)

    return {
        'is_blocked': True,
        'detail': 'User blocked.',
    }
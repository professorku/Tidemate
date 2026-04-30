from django.contrib.auth.models import User

from bookings.models import Booking
from listings.models import BoatListing

from .models import Profile

PUBLIC_PROFILE_STAT_KEYS = ("boats_listed",)
PRIVATE_PROFILE_STAT_KEYS = ("boats_listed", "bookings_made", "host_bookings", "confirmed_trips")


def get_or_create_profile_for_user(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def get_user_by_id(user_id):
    return (
        User.objects
        .select_related('profile')
        .filter(pk=user_id, is_active=True)
        .first()
    )


def get_profile_stats_for_user(user):
    return {
        'boats_listed': BoatListing.objects.filter(host=user).count(),
        'bookings_made': Booking.objects.filter(renter=user).count(),
        'host_bookings': Booking.objects.filter(boat__host=user).count(),
        'confirmed_trips': Booking.objects.filter(
            renter=user,
            status='confirmed',
        ).count(),
    }


def filter_profile_stats(stats, *, include_private_stats):
    allowed_keys = PRIVATE_PROFILE_STAT_KEYS if include_private_stats else PUBLIC_PROFILE_STAT_KEYS
    return {key: stats[key] for key in allowed_keys}


def get_relationship_payload(*, viewer, target_user, target_profile):
    relationship = {
        'is_me': False,
        'is_crewmate': False,
        'is_blocked': False,
        'has_blocked_you': False,
        'can_message': True,
    }

    if not viewer or not viewer.is_authenticated:
        return relationship

    viewer_profile = get_or_create_profile_for_user(viewer)

    relationship['is_me'] = viewer.id == target_user.id
    relationship['is_crewmate'] = viewer_profile.contacts.filter(id=target_user.id).exists()
    relationship['is_blocked'] = viewer_profile.blocked_users.filter(id=target_user.id).exists()
    relationship['has_blocked_you'] = target_profile.blocked_users.filter(id=viewer.id).exists()
    relationship['can_message'] = (
        viewer.id != target_user.id
        and not relationship['is_blocked']
        and not relationship['has_blocked_you']
    )

    return relationship


def build_profile_payload(*, user, request, serializer_class, include_private_stats=False):
    profile = get_or_create_profile_for_user(user)
    serializer = serializer_class(profile, context={'request': request})

    data = serializer.data
    data['id'] = user.id
    data['stats'] = filter_profile_stats(
        get_profile_stats_for_user(user),
        include_private_stats=include_private_stats,
    )
    data['relationship'] = get_relationship_payload(
        viewer=getattr(request, 'user', None),
        target_user=user,
        target_profile=profile,
    )
    return data
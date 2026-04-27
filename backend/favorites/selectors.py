from .models import Favorite


def get_user_favorites_queryset(user):
    return (
        Favorite.objects
        .filter(user=user)
        .select_related('boat', 'boat__host', 'boat__host__profile')
        .prefetch_related('boat__images')
        .order_by('-created_at', '-id')
    )


def get_user_favorites_for_delete(user):
    return Favorite.objects.filter(user=user)

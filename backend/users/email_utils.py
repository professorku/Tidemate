from django.contrib.auth import get_user_model

from .models import Profile


User = get_user_model()


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def user_email_exists(email: str, *, exclude_user_id=None) -> bool:
    normalized_email = normalize_email(email)

    queryset = User.objects.filter(email__iexact=normalized_email)

    if exclude_user_id is not None:
        queryset = queryset.exclude(pk=exclude_user_id)

    return queryset.exists()


def pending_email_exists(email: str, *, exclude_user_id=None) -> bool:
    normalized_email = normalize_email(email)

    queryset = Profile.objects.filter(pending_email__iexact=normalized_email)

    if exclude_user_id is not None:
        queryset = queryset.exclude(user_id=exclude_user_id)

    return queryset.exists()
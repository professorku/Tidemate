import re

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework import serializers

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from .email_utils import normalize_email
from .models import GoogleAccount, MAX_PROFILE_DISPLAY_NAME_LENGTH, Profile


User = get_user_model()

USERNAME_SAFE_CHARS_RE = re.compile(r"[^a-zA-Z0-9_@.+-]+")


class GoogleAuthError(serializers.ValidationError):
    pass


def verify_google_id_token(credential):
    client_id = getattr(settings, "GOOGLE_OAUTH_CLIENT_ID", "").strip()

    if not client_id:
        raise GoogleAuthError({"detail": "Google login is not configured."})

    try:
        return google_id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            client_id,
        )
    except ValueError as exc:
        raise GoogleAuthError({"detail": "Google login token is invalid."}) from exc


def _clean_username_base(value):
    value = (value or "").strip().split("@")[0]
    value = USERNAME_SAFE_CHARS_RE.sub("", value).strip("._-+")
    return value[:40] or "tidemate_user"


def _unique_username(email, name=""):
    base = _clean_username_base(email or name)

    if not User.objects.filter(username__iexact=base).exists():
        return base

    for suffix in range(2, 10000):
        candidate = f"{base[:140]}{suffix}"
        if not User.objects.filter(username__iexact=candidate).exists():
            return candidate

    raise GoogleAuthError({"detail": "Could not create a unique username for this Google account."})


def _payload_email_is_verified(payload):
    value = payload.get("email_verified")
    return value is True or str(value).lower() == "true"


def _set_display_name_from_google(user, name):
   
    name = (name or "").strip()

    if not name:
        return

    profile, _ = Profile.objects.get_or_create(user=user)

    if not profile.display_name:
        profile.display_name = name[:MAX_PROFILE_DISPLAY_NAME_LENGTH]
        profile.save(update_fields=["display_name"])


@transaction.atomic
def get_or_create_user_from_google_credential(credential):
    if not credential or not isinstance(credential, str):
        raise GoogleAuthError({"credential": ["Google credential is required."]})

    payload = verify_google_id_token(credential)
    google_sub = str(payload.get("sub") or "").strip()
    email = normalize_email(payload.get("email"))
    name = str(payload.get("name") or "").strip()
    picture_url = str(payload.get("picture") or "").strip()

    if not google_sub:
        raise GoogleAuthError({"detail": "Google login token is missing a subject."})

    if not email:
        raise GoogleAuthError({"detail": "Google account did not provide an email address."})

    if not _payload_email_is_verified(payload):
        raise GoogleAuthError({"detail": "Google account email is not verified."})

    google_account = (
        GoogleAccount.objects.select_for_update()
        .select_related("user")
        .filter(google_sub=google_sub)
        .first()
    )

    if google_account:
        fields_to_update = []

        if google_account.email != email:
            google_account.email = email
            fields_to_update.append("email")

        if google_account.name != name:
            google_account.name = name
            fields_to_update.append("name")

        if google_account.picture_url != picture_url:
            google_account.picture_url = picture_url
            fields_to_update.append("picture_url")

        if fields_to_update:
            google_account.save(update_fields=[*fields_to_update, "updated_at"])

        user = google_account.user

        if not user.is_active:
            user.is_active = True
            user.save(update_fields=["is_active"])

        _set_display_name_from_google(user, name)

        return user, False

    user = User.objects.select_for_update().filter(email__iexact=email).first()
    created = False

    if user is None:
        username = _unique_username(email=email, name=name)
        user = User(username=username, email=email, is_active=True)
        user.set_unusable_password()

        try:
            user.save()
        except IntegrityError as exc:
            raise GoogleAuthError({"detail": "Could not create a user for this Google account."}) from exc

        created = True

    elif not user.is_active:
        user.is_active = True
        user.save(update_fields=["is_active"])

    try:
        GoogleAccount.objects.create(
            user=user,
            google_sub=google_sub,
            email=email,
            name=name,
            picture_url=picture_url,
        )
    except IntegrityError as exc:
        raise GoogleAuthError({"detail": "This Google account is already linked to another user."}) from exc

    _set_display_name_from_google(user, name)

    return user, created
from django.conf import settings
from django.contrib.auth.models import User
from django.core import signing
from django.core.mail import send_mail
from django.db import IntegrityError, transaction

from .models import Profile


EMAIL_VERIFICATION_SALT = "users.email_verification"
EMAIL_CHANGE_VERIFICATION_SALT = "users.email_change_verification"


def build_email_verification_token(user: User) -> str:
    return signing.dumps(
        {
            "user_id": user.id,
            "email": user.email,
        },
        salt=EMAIL_VERIFICATION_SALT,
    )


def build_email_verification_link(user: User) -> str:
    token = build_email_verification_token(user)
    return f"{settings.FRONTEND_URL}/verify-email?token={token}"


def send_verification_email(user: User) -> str:
    verification_link = build_email_verification_link(user)
    send_mail(
        subject="Verify your TideMate email",
        message=(
            "Welcome to TideMate!\n\n"
            "Please verify your email address by opening this link:\n"
            f"{verification_link}\n\n"
            "If you did not create this account, you can ignore this email.\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return verification_link


def verify_email_token(token: str) -> User:
    payload = signing.loads(
        token,
        salt=EMAIL_VERIFICATION_SALT,
        max_age=settings.EMAIL_VERIFICATION_MAX_AGE_SECONDS,
    )
    user = User.objects.get(id=payload["user_id"])
    if user.email.lower() != payload["email"].lower():
        raise signing.BadSignature("Email mismatch.")
    return user


def build_email_change_verification_token(user: User, pending_email: str) -> str:
    normalized_pending_email = pending_email.strip().lower()

    return signing.dumps(
        {
            "user_id": user.id,
            "current_email": user.email,
            "pending_email": normalized_pending_email,
        },
        salt=EMAIL_CHANGE_VERIFICATION_SALT,
    )


def build_email_change_verification_link(user: User, pending_email: str) -> str:
    token = build_email_change_verification_token(user, pending_email)
    return f"{settings.FRONTEND_URL}/verify-email-change?token={token}"


def send_email_change_verification_email(user: User, pending_email: str) -> str:
    normalized_pending_email = pending_email.strip().lower()
    verification_link = build_email_change_verification_link(user, normalized_pending_email)

    send_mail(
        subject="Verify your new TideMate email",
        message=(
            "A request was made to change the email address on your TideMate account.\n\n"
            f"Current email: {user.email}\n"
            f"New email: {normalized_pending_email}\n\n"
            "To confirm this change, open this link:\n"
            f"{verification_link}\n\n"
            "If you did not request this change, do not open this link. "
            "Your current email address will stay unchanged unless the new email is verified.\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[normalized_pending_email],
        fail_silently=False,
    )

    return verification_link


def send_email_change_security_alert_email(user: User, pending_email: str) -> None:
    normalized_pending_email = pending_email.strip().lower()

    send_mail(
        subject="TideMate email change requested",
        message=(
            "A request was made to change the email address on your TideMate account.\n\n"
            f"Current email: {user.email}\n"
            f"Requested new email: {normalized_pending_email}\n\n"
            "If this was you, no action is needed from this email address. "
            "A verification link has been sent to the new email address.\n\n"
            "If this was not you, your current email has not been changed yet. "
            "Please change your password immediately and contact support if needed.\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def _get_email_change_max_age_seconds() -> int:
    return int(
        getattr(
            settings,
            "EMAIL_CHANGE_VERIFICATION_MAX_AGE_SECONDS",
            settings.EMAIL_VERIFICATION_MAX_AGE_SECONDS,
        )
    )


def verify_email_change_token(token: str) -> User:
    try:
        return _verify_email_change_token_in_transaction(token)
    except IntegrityError:
        # Database-level protection for the race where another user verifies or
        # signs up with the same email after the application-level check.
        raise signing.BadSignature("Email address is already in use.")


@transaction.atomic
def _verify_email_change_token_in_transaction(token: str) -> User:
    payload = signing.loads(
        token,
        salt=EMAIL_CHANGE_VERIFICATION_SALT,
        max_age=_get_email_change_max_age_seconds(),
    )

    try:
        user_id = payload["user_id"]
        current_email = payload["current_email"].strip().lower()
        pending_email = payload["pending_email"].strip().lower()
    except (KeyError, AttributeError):
        raise signing.BadSignature("Invalid email change token payload.")

    user = User.objects.select_for_update().get(id=user_id)

    try:
        profile = Profile.objects.select_for_update().get(user=user)
    except Profile.DoesNotExist:
        raise signing.BadSignature("Profile not found.")

    if user.email.lower() != current_email:
        raise signing.BadSignature("Current email no longer matches this request.")

    if not profile.pending_email:
        raise signing.BadSignature("There is no pending email change.")

    if profile.pending_email.lower() != pending_email:
        raise signing.BadSignature("Pending email does not match this request.")

    email_taken = User.objects.filter(
        email__iexact=pending_email,
    ).exclude(
        pk=user.pk,
    ).exists()

    if email_taken:
        raise signing.BadSignature("Email address is already in use.")

    user.email = pending_email
    user.save(update_fields=["email"])

    profile.pending_email = None
    profile.pending_email_requested_at = None
    profile.save(update_fields=["pending_email", "pending_email_requested_at"])

    return user
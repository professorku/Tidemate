from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode


RESET_PASSWORD_PATH = "/reset-password"


def build_password_reset_uid(user: User) -> str:
    return urlsafe_base64_encode(force_bytes(user.pk))


def build_password_reset_token(user: User) -> str:
    return default_token_generator.make_token(user)


def build_password_reset_link(user: User) -> str:
    uid = build_password_reset_uid(user)
    token = build_password_reset_token(user)
    return f"{settings.FRONTEND_URL}{RESET_PASSWORD_PATH}?uid={uid}&token={token}"


def send_password_reset_email(user: User) -> str:
    reset_link = build_password_reset_link(user)
    send_mail(
        subject="Reset your TideMate password",
        message=(
            "We received a request to reset your TideMate password.\n\n"
            "Open this link to choose a new password:\n"
            f"{reset_link}\n\n"
            "If you did not request this, you can safely ignore this email.\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return reset_link


def get_user_from_reset_uid(uid: str) -> User:
    user_id = force_str(urlsafe_base64_decode(uid))
    return User.objects.get(pk=user_id)


def verify_password_reset_token(user: User, token: str) -> bool:
    return default_token_generator.check_token(user, token)

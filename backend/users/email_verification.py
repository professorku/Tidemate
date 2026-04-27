from django.conf import settings
from django.contrib.auth.models import User
from django.core import signing
from django.core.mail import send_mail

EMAIL_VERIFICATION_SALT = "users.email_verification"


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

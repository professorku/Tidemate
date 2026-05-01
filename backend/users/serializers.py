from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from rest_framework import serializers

from .email_utils import normalize_email, user_email_exists
from .password_reset import get_user_from_reset_uid, verify_password_reset_token
from .profile_serializers import MyProfileSerializer, PublicProfileSerializer


User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_username(self, value):
        value = (value or "").strip()

        if not value:
            raise serializers.ValidationError("Username is required.")

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists.")

        return value

    def validate_email(self, value):
        normalized_email = normalize_email(value)

        if not normalized_email:
            raise serializers.ValidationError("Email is required.")

        if user_email_exists(normalized_email):
            raise serializers.ValidationError("Email already exists.")

        return normalized_email

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        try:
            return User.objects.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
                is_active=False,
            )
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {
                    "detail": "An account with this username or email already exists."
                }
            ) from exc


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return normalize_email(value)


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True, trim_whitespace=True)
    token = serializers.CharField(required=True, trim_whitespace=True)
    new_password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    def validate(self, attrs):
        uid = attrs.get("uid", "")
        token = attrs.get("token", "")

        try:
            user = get_user_from_reset_uid(uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError(
                {"detail": "Reset link is invalid or has expired."}
            )

        if not verify_password_reset_token(user, token):
            raise serializers.ValidationError(
                {"detail": "Reset link is invalid or has expired."}
            )

        validate_password(attrs["new_password"], user=user)
        attrs["user"] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    def validate_current_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")

        return value

    def validate_new_password(self, value):
        user = self.context["request"].user
        validate_password(value, user=user)
        return value


ProfileSerializer = MyProfileSerializer


__all__ = [
    "SignupSerializer",
    "ForgotPasswordSerializer",
    "ResetPasswordSerializer",
    "ChangePasswordSerializer",
    "ProfileSerializer",
    "MyProfileSerializer",
    "PublicProfileSerializer",
]
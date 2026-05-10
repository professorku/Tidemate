from django.conf import settings
from django.contrib.auth.models import User
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings
from rest_framework_simplejwt.tokens import RefreshToken


class TideMateTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        **TokenObtainPairSerializer.default_error_messages,
        "no_active_account": "Invalid username or password.",
    }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        jwt_settings = getattr(settings, "SIMPLE_JWT", {})
        audience = jwt_settings.get("AUDIENCE")
        issuer = jwt_settings.get("ISSUER")
        if audience:
            token["aud"] = audience
        if issuer:
            token["iss"] = issuer
        return token

    def validate(self, attrs):
        username = attrs.get(self.username_field, "")

        if isinstance(username, str):
            attrs[self.username_field] = username.strip()

        return super().validate(attrs)


def get_user_from_refresh_token(token):
    validated_token = RefreshToken(token)
    user_id = validated_token.get(jwt_api_settings.USER_ID_CLAIM)
    if user_id is None:
        raise InvalidToken("Refresh token is missing the user identifier.")

    user = User.objects.filter(pk=user_id).first()
    if user is None:
        raise InvalidToken("User for refresh token was not found.")

    return user


def get_token_pair_for_user(user):
    refresh = TideMateTokenObtainPairSerializer.get_token(user)
    return str(refresh.access_token), str(refresh)
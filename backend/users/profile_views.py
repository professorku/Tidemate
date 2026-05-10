import logging

from rest_framework.decorators import api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from config.throttling import ProfileWriteRateThrottle, PublicProfileAnonRateThrottle

from .auth_helpers import enforce_csrf
from .profile_serializers import MyProfileSerializer, PublicProfileSerializer
from .selectors import build_profile_payload, get_user_by_id
from .services import update_my_profile

logger = logging.getLogger(__name__)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@throttle_classes([ProfileWriteRateThrottle])
def me(request):
    if request.method == "PATCH":
        csrf_error = enforce_csrf(request)
        if csrf_error:
            return csrf_error

        try:
            update_my_profile(user=request.user, data=request.data, serializer_class=MyProfileSerializer, request=request)
        except ValidationError as exc:
            logger.info("Profile update rejected for user %s: %s", request.user.id, exc)
            return Response(exc.detail, status=400)

    return Response(
        build_profile_payload(
            user=request.user,
            request=request,
            serializer_class=MyProfileSerializer,
            include_private_stats=True,
        )
    )


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([PublicProfileAnonRateThrottle])
def public_profile(request, user_id):
    user = get_user_by_id(user_id)
    if not user:
        return Response({"detail": "User not found."}, status=404)

    return Response(
        build_profile_payload(
            user=user,
            request=request,
            serializer_class=PublicProfileSerializer,
            include_private_stats=False,
        )
    )
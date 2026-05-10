from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from config.throttling import RelationshipWriteRateThrottle

from .auth_helpers import enforce_csrf
from .selectors import get_user_by_id
from .services import toggle_block_for_user, toggle_crewmate_for_user


def _get_target_user_or_404(user_id):
    target_user = get_user_by_id(user_id)
    if not target_user:
        return None, Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    return target_user, None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([RelationshipWriteRateThrottle])
def toggle_crewmate(request, user_id):
    csrf_error = enforce_csrf(request)
    if csrf_error:
        return csrf_error

    target_user, error_response = _get_target_user_or_404(user_id)
    if error_response:
        return error_response

    try:
        result = toggle_crewmate_for_user(actor=request.user, target_user=target_user)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except PermissionError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)

    return Response(result)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([RelationshipWriteRateThrottle])
def toggle_block_user(request, user_id):
    csrf_error = enforce_csrf(request)
    if csrf_error:
        return csrf_error

    target_user, error_response = _get_target_user_or_404(user_id)
    if error_response:
        return error_response

    try:
        result = toggle_block_for_user(actor=request.user, target_user=target_user)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(result)
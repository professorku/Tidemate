from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response


class BookingRequestContextMixin:
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


def booking_not_found_response():
    return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)


def exception_to_response(exc):
    if isinstance(exc, PermissionError):
        return Response({'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)
    if isinstance(exc, ValueError):
        return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    if isinstance(exc, ValidationError):
        return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
    raise exc

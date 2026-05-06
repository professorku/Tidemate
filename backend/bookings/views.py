import logging

from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from config.pagination import BookingsPagination
from config.throttling import BookingWriteRateThrottle
from .expiry import expire_visible_pending_bookings_for_user

from .read_serializers import BookingReadSerializer
from .selectors import (
    apply_timeline_filter,
    get_host_booking_counts,
    get_host_booking_for_user,
    get_host_bookings,
    get_user_booking_counts,
    get_user_bookings,
    get_visible_booking_for_user,
)
from .services import cancel_booking, confirm_booking, create_booking, delete_booking
from .view_helpers import (
    BookingRequestContextMixin,
    booking_not_found_response,
    exception_to_response,
)
from .write_serializers import BookingCreateSerializer

logger = logging.getLogger(__name__)


class BookingCreateView(BookingRequestContextMixin, generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BookingWriteRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = create_booking(serializer=serializer)

        read_serializer = BookingReadSerializer(
            booking,
            context=self.get_serializer_context(),
        )
        headers = self.get_success_headers(read_serializer.data)

        return Response(
            read_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class MyBookingsView(BookingRequestContextMixin, generics.ListAPIView):
    serializer_class = BookingReadSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = BookingsPagination

    def get_queryset(self):
        expire_visible_pending_bookings_for_user(self.request.user)

        queryset = get_user_bookings(self.request.user)
        timeline = self.request.query_params.get('timeline')
        return apply_timeline_filter(queryset, timeline)


class MyBookingCountsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        expire_visible_pending_bookings_for_user(request.user)

        counts = get_user_booking_counts(request.user)
        return Response(counts, status=status.HTTP_200_OK)


class HostBookingsView(BookingRequestContextMixin, generics.ListAPIView):
    serializer_class = BookingReadSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = BookingsPagination

    def get_queryset(self):
        expire_visible_pending_bookings_for_user(self.request.user)

        status_param = self.request.query_params.get('status')
        return get_host_bookings(self.request.user, status_value=status_param)


class HostBookingCountsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        expire_visible_pending_bookings_for_user(request.user)

        counts = get_host_booking_counts(request.user)
        return Response(counts, status=status.HTTP_200_OK)


class BookingDetailView(BookingRequestContextMixin, generics.RetrieveAPIView):
    serializer_class = BookingReadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        expire_visible_pending_bookings_for_user(self.request.user)

        booking = get_visible_booking_for_user(self.request.user, self.kwargs['pk'])
        if not booking:
            from django.http import Http404

            raise Http404
        return booking


class BookingConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BookingWriteRateThrottle]

    def post(self, request, pk):
        booking = get_host_booking_for_user(request.user, pk)
        if not booking:
            return booking_not_found_response()

        try:
            booking = confirm_booking(booking=booking)
        except (PermissionError, ValueError, ValidationError) as exc:
            logger.info(
                "Booking confirm rejected for booking %s by user %s: %s",
                pk,
                request.user.id,
                exc,
            )
            return exception_to_response(exc)

        serializer = BookingReadSerializer(booking, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class BookingCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BookingWriteRateThrottle]

    def post(self, request, pk):
        booking = get_visible_booking_for_user(request.user, pk)
        if not booking:
            return booking_not_found_response()

        try:
            booking = cancel_booking(
                booking=booking,
                actor=request.user,
                data=request.data,
            )
        except (PermissionError, ValueError, ValidationError) as exc:
            logger.info(
                "Booking cancel rejected for booking %s by user %s: %s",
                pk,
                request.user.id,
                exc,
            )
            return exception_to_response(exc)

        serializer = BookingReadSerializer(booking, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class BookingDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BookingWriteRateThrottle]

    def delete(self, request, pk):
        expire_visible_pending_bookings_for_user(request.user)

        booking = get_visible_booking_for_user(request.user, pk)
        if not booking:
            return booking_not_found_response()

        try:
            delete_booking(booking=booking, actor=request.user)
        except (PermissionError, ValueError, ValidationError) as exc:
            logger.info(
                "Booking delete rejected for booking %s by user %s: %s",
                pk,
                request.user.id,
                exc,
            )
            return exception_to_response(exc)

        return Response(status=status.HTTP_204_NO_CONTENT)
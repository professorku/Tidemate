from rest_framework import generics, permissions
from rest_framework.response import Response

from config.pagination import BookingsPagination, ReviewsPagination
from config.throttling import ReviewRateThrottle

from .serializers import CreateReviewSerializer, ReviewSerializer
from .review_queries import (
    get_boat_reviews_queryset,
    get_review_stats,
    get_user_reviews_queryset,
)
from .review_services import (
    build_reviewable_booking_payload,
    create_review_notification,
    get_reviewable_bookings_for_user,
)


class ReviewListViewMixin:
    serializer_class = ReviewSerializer
    pagination_class = ReviewsPagination
    permission_classes = [permissions.AllowAny]

    def build_queryset(self):
        raise NotImplementedError

    def get_queryset(self):
        return self.build_queryset()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        stats = get_review_stats(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data.update(stats)
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({**stats, 'results': serializer.data})


class BoatReviewListView(ReviewListViewMixin, generics.ListAPIView):
    def build_queryset(self):
        return get_boat_reviews_queryset(self.kwargs['boat_id'])


class UserReviewListView(ReviewListViewMixin, generics.ListAPIView):
    def build_queryset(self):
        return get_user_reviews_queryset(self.kwargs['user_id'])


class CreateReviewView(generics.CreateAPIView):
    serializer_class = CreateReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ReviewRateThrottle]

    def perform_create(self, serializer):
        review = serializer.save()
        create_review_notification(review)


class MyReviewableBookingsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = BookingsPagination

    def get_queryset(self):
        return get_reviewable_bookings_for_user(self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        bookings = page if page is not None else queryset

        payload = []
        for booking in bookings:
            item = build_reviewable_booking_payload(booking, request.user)
            if item is not None:
                payload.append(item)

        if page is not None:
            return self.get_paginated_response(payload)

        return Response(payload)

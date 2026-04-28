from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.pagination import NotificationsPagination

from .selectors import get_user_notifications_for_update, get_user_notifications_queryset
from .serializers import NotificationSerializer
from .services import mark_all_notifications_read, mark_notification_read


class MyNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationsPagination

    def get_queryset(self):
        return get_user_notifications_queryset(self.request.user)


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_notification(self, request, pk):
        return get_object_or_404(
            get_user_notifications_for_update(request.user),
            pk=pk,
        )

    def patch(self, request, pk):
        notification = self._get_notification(request, pk)
        notification = mark_notification_read(notification=notification)

        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        notification = self._get_notification(request, pk)
        notification = mark_notification_read(notification=notification)

        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        updated_count = mark_all_notifications_read(user=request.user)

        return Response(
            {
                "marked_count": updated_count,
            },
            status=status.HTTP_200_OK,
        )
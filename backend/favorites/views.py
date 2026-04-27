from rest_framework import generics, permissions

from config.pagination import FavoritesPagination

from .selectors import get_user_favorites_for_delete, get_user_favorites_queryset
from .serializers import FavoriteSerializer
from .services import create_favorite


class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FavoritesPagination

    def get_queryset(self):
        return get_user_favorites_queryset(self.request.user)

    def perform_create(self, serializer):
        create_favorite(serializer=serializer, user=self.request.user)


class FavoriteDeleteView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return get_user_favorites_for_delete(self.request.user)

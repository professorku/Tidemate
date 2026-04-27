from django.urls import path
from .views import FavoriteListCreateView, FavoriteDeleteView

urlpatterns = [
    path('', FavoriteListCreateView.as_view()),
    path('<int:pk>/', FavoriteDeleteView.as_view()),
]
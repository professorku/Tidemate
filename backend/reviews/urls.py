from django.urls import path
from .views import (
    BoatReviewListView,
    UserReviewListView,
    CreateReviewView,
    MyReviewableBookingsView,
)

urlpatterns = [
    path('boats/<int:boat_id>/', BoatReviewListView.as_view(), name='boat-reviews'),
    path('users/<int:user_id>/', UserReviewListView.as_view(), name='user-reviews'),
    path('create/', CreateReviewView.as_view(), name='create-review'),
    path('my-reviewable-bookings/', MyReviewableBookingsView.as_view(), name='my-reviewable-bookings'),
]
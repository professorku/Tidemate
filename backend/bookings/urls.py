from django.urls import path

from .views import (
    BookingCancelView,
    BookingConfirmView,
    BookingCreateView,
    BookingDeleteView,
    BookingDetailView,
    HostBookingsView,
    MyBookingsView,
)

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking-create'),
    path('my/', MyBookingsView.as_view(), name='my-bookings'),
    path('host/', HostBookingsView.as_view(), name='host-bookings'),
    path('<str:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<str:pk>/delete/', BookingDeleteView.as_view(), name='booking-delete'),
    path('<str:pk>/confirm/', BookingConfirmView.as_view(), name='booking-confirm'),
    path('<str:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
]
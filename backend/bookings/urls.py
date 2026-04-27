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
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/delete/', BookingDeleteView.as_view(), name='booking-delete'),
    path('<int:pk>/confirm/', BookingConfirmView.as_view(), name='booking-confirm'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
]
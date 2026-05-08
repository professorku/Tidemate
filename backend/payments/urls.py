from django.urls import path

from .views import (
    BookingCheckoutSessionView,
    BookingPaymentStatusView,
    stripe_webhook,
)

urlpatterns = [
    path(
        'bookings/<str:booking_id>/checkout/',
        BookingCheckoutSessionView.as_view(),
        name='payment-booking-checkout',
    ),
    path(
        'bookings/<str:booking_id>/',
        BookingPaymentStatusView.as_view(),
        name='payment-booking-status',
    ),
    path('stripe/webhook/', stripe_webhook, name='stripe-webhook'),
]
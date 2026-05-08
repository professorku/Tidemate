import logging

import stripe
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.throttling import BookingWriteRateThrottle

from .models import Payment
from .serializers import PaymentReadSerializer
from .services import (
    StripeNotConfiguredError,
    create_checkout_session_for_booking,
    get_payment_for_visible_booking,
    mark_checkout_session_completed,
    mark_checkout_session_expired,
)

logger = logging.getLogger(__name__)


class BookingCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [BookingWriteRateThrottle]

    def post(self, request, booking_id):
        try:
            result = create_checkout_session_for_booking(
                user=request.user,
                booking_lookup=booking_id,
            )
        except PermissionError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except StripeNotConfiguredError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except stripe.StripeError:
            logger.exception('Stripe failed while creating Checkout Session.')
            return Response(
                {'detail': 'Could not start Stripe Checkout. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment = result['payment']
        return Response(
            {
                'checkout_url': result['checkout_url'],
                'booking_public_id': result['booking'].public_id,
                'payment': PaymentReadSerializer(payment).data,
                'reused': result['reused'],
            },
            status=status.HTTP_200_OK,
        )


class BookingPaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        payment = get_payment_for_visible_booking(
            user=request.user,
            booking_lookup=booking_id,
        )

        if not payment:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentReadSerializer(payment).data, status=status.HTTP_200_OK)


@csrf_exempt
def stripe_webhook(request):
    if request.method != 'POST':
        return HttpResponse(status=405)

    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '').strip()
    if not webhook_secret:
        logger.error('STRIPE_WEBHOOK_SECRET is not configured.')
        return JsonResponse({'detail': 'Webhook not configured.'}, status=500)

    payload = request.body
    signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=webhook_secret,
        )
    except ValueError:
        return JsonResponse({'detail': 'Invalid payload.'}, status=400)
    except stripe.SignatureVerificationError:
        return JsonResponse({'detail': 'Invalid signature.'}, status=400)

    event_type = event.get('type')
    data_object = event.get('data', {}).get('object', {})

    if event_type == 'checkout.session.completed':
        mark_checkout_session_completed(data_object)
    elif event_type == 'checkout.session.expired':
        mark_checkout_session_expired(data_object)
    elif event_type == 'checkout.session.async_payment_failed':
        session_id = data_object.get('id')
        Payment.objects.filter(stripe_checkout_session_id=session_id).update(
            status=Payment.STATUS_FAILED,
        )

    return JsonResponse({'received': True})
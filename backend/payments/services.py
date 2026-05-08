import logging
from decimal import Decimal, ROUND_HALF_UP

import stripe
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from bookings.expiry import expire_booking_if_needed, get_payment_booking_expiry_at
from bookings.models import Booking
from bookings.selectors import get_booking_lookup_filter
from notifications.models import Notification

from .models import Payment

logger = logging.getLogger(__name__)


class StripeNotConfiguredError(RuntimeError):
    pass


def get_stripe_api_key():
    api_key = getattr(settings, 'STRIPE_SECRET_KEY', '').strip()
    if not api_key:
        raise StripeNotConfiguredError('Stripe is not configured on the server.')
    return api_key


def amount_decimal_to_ore(amount):
    decimal_amount = Decimal(amount)
    return int((decimal_amount * Decimal('100')).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def build_checkout_success_url(booking):
    return (
        f'{settings.FRONTEND_URL}/payments/success'
        f'?booking={booking.public_id}'
        '&session_id={CHECKOUT_SESSION_ID}'
    )


def build_checkout_cancel_url(booking):
    return f'{settings.FRONTEND_URL}/payments/cancelled?booking={booking.public_id}'


def _get_booking_for_checkout(*, user, booking_lookup):
    return (
        Booking.objects.select_related('boat', 'boat__host', 'renter')
        .select_for_update()
        .filter(get_booking_lookup_filter(booking_lookup), renter=user)
        .first()
    )


def _get_or_create_payment_for_booking(booking):
    amount_ore = amount_decimal_to_ore(booking.total_price)

    if amount_ore <= 0:
        raise ValidationError({'detail': 'Booking amount must be greater than zero.'})

    payment, created = Payment.objects.select_for_update().get_or_create(
        booking=booking,
        defaults={
            'amount_ore': amount_ore,
            'currency': settings.STRIPE_CURRENCY.lower(),
        },
    )

    if not created:
        update_fields = []

        if payment.amount_ore != amount_ore:
            payment.amount_ore = amount_ore
            update_fields.append('amount_ore')

        if payment.currency != settings.STRIPE_CURRENCY.lower():
            payment.currency = settings.STRIPE_CURRENCY.lower()
            update_fields.append('currency')

        if update_fields:
            update_fields.append('updated_at')
            payment.save(update_fields=update_fields)

    return payment


def _get_existing_open_checkout_url(payment):
    if not payment.stripe_checkout_session_id:
        return ''

    try:
        session = stripe.checkout.Session.retrieve(payment.stripe_checkout_session_id)
    except stripe.StripeError:
        logger.info(
            'Could not retrieve existing Stripe Checkout Session %s.',
            payment.stripe_checkout_session_id,
            exc_info=True,
        )
        return ''

    if session.get('status') == 'open' and session.get('url'):
        return session['url']

    return ''


@transaction.atomic
def create_checkout_session_for_booking(*, user, booking_lookup):
    stripe.api_key = get_stripe_api_key()

    booking = _get_booking_for_checkout(user=user, booking_lookup=booking_lookup)
    if not booking:
        raise PermissionError('Booking not found.')

    if expire_booking_if_needed(booking):
        raise ValidationError({
            'detail': 'This booking is no longer payable because the payment deadline has passed.'
        })

    if booking.status == 'confirmed':
        raise ValidationError({'detail': 'This booking is already paid and confirmed.'})

    if booking.status != 'awaiting_payment':
        raise ValidationError({
            'detail': 'This booking is not ready for payment yet.'
        })

    payment = _get_or_create_payment_for_booking(booking)

    if payment.status == Payment.STATUS_PAID:
        raise ValidationError({'detail': 'This booking is already paid.'})

    existing_checkout_url = _get_existing_open_checkout_url(payment)
    if existing_checkout_url:
        return {
            'checkout_url': existing_checkout_url,
            'booking': booking,
            'payment': payment,
            'reused': True,
        }

    expires_at = get_payment_booking_expiry_at(now=timezone.now())
    if not booking.expires_at or booking.expires_at > expires_at:
        booking.expires_at = expires_at
        booking.save(update_fields=['expires_at'])

    session = stripe.checkout.Session.create(
        mode='payment',
        success_url=build_checkout_success_url(booking),
        cancel_url=build_checkout_cancel_url(booking),
        client_reference_id=booking.public_id,
        customer_email=booking.renter.email or None,
        line_items=[
            {
                'quantity': 1,
                'price_data': {
                    'currency': payment.currency,
                    'unit_amount': payment.amount_ore,
                    'product_data': {
                        'name': f'TideMate booking {booking.public_id}',
                        'description': (
                            f'{booking.boat.title} · '
                            f'{booking.start_date.isoformat()} to {booking.end_date.isoformat()}'
                        ),
                    },
                },
            }
        ],
        metadata={
            'booking_id': str(booking.id),
            'booking_public_id': booking.public_id,
            'payment_id': str(payment.id),
            'renter_id': str(booking.renter_id),
            'host_id': str(booking.boat.host_id),
        },
        payment_intent_data={
            'metadata': {
                'booking_id': str(booking.id),
                'booking_public_id': booking.public_id,
                'payment_id': str(payment.id),
            },
        },
        expires_at=int(booking.expires_at.timestamp()),
    )

    payment.mark_checkout_created(
        checkout_session_id=session['id'],
        payment_intent_id=session.get('payment_intent') or '',
        customer_id=session.get('customer') or '',
    )

    return {
        'checkout_url': session['url'],
        'booking': booking,
        'payment': payment,
        'reused': False,
    }


def user_can_view_payment(user, payment):
    return (
        payment.booking.renter_id == user.id
        or payment.booking.boat.host_id == user.id
        or user.is_staff
    )


def get_payment_for_visible_booking(*, user, booking_lookup):
    queryset = Payment.objects.select_related(
        'booking',
        'booking__boat',
        'booking__renter',
    ).filter(
        booking__in=Booking.objects.filter(get_booking_lookup_filter(booking_lookup)),
    )

    if not user.is_staff:
        queryset = queryset.filter(
            Q(booking__renter=user) | Q(booking__boat__host=user)
        )

    return queryset.first()


@transaction.atomic
def mark_checkout_session_completed(session):
    session_id = session.get('id')
    payment = (
        Payment.objects.select_related('booking', 'booking__boat', 'booking__renter')
        .select_for_update()
        .filter(stripe_checkout_session_id=session_id)
        .first()
    )

    if not payment:
        logger.warning('Stripe checkout completed for unknown session %s.', session_id)
        return None

    booking = (
        Booking.objects.select_for_update()
        .select_related('boat', 'renter')
        .get(pk=payment.booking_id)
    )

    expected_currency = payment.currency.lower()
    actual_currency = str(session.get('currency') or '').lower()
    actual_amount = session.get('amount_total')

    if actual_currency != expected_currency or actual_amount != payment.amount_ore:
        logger.error(
            'Stripe amount mismatch for booking %s. Expected %s %s, got %s %s.',
            booking.public_id,
            payment.amount_ore,
            expected_currency,
            actual_amount,
            actual_currency,
        )
        payment.mark_failed()
        return payment

    if session.get('payment_status') != 'paid':
        logger.warning(
            'Checkout session %s completed but payment_status=%s.',
            session_id,
            session.get('payment_status'),
        )
        return payment

    payment.mark_paid(
        payment_intent_id=session.get('payment_intent') or '',
        customer_id=session.get('customer') or '',
    )

    if booking.status == 'confirmed':
        return payment

    if booking.status != 'awaiting_payment':
        logger.error(
            'Booking %s was paid in Stripe but has status %s. Manual review/refund may be needed.',
            booking.public_id,
            booking.status,
        )
        return payment

    booking.status = 'confirmed'
    booking.expires_at = None
    booking.save(update_fields=['status', 'expires_at'])

    Notification.objects.create(
        user=booking.renter,
        message=f'Your payment for "{booking.boat.title}" was received and the booking is confirmed.',
        target_url=f'/bookings/{booking.public_id}',
    )

    Notification.objects.create(
        user=booking.boat.host,
        message=f'The renter paid for "{booking.boat.title}". The booking is now confirmed.',
        target_url=f'/bookings/{booking.public_id}',
    )

    return payment


@transaction.atomic
def mark_checkout_session_expired(session):
    session_id = session.get('id')
    payment = (
        Payment.objects.select_related('booking', 'booking__boat', 'booking__renter')
        .select_for_update()
        .filter(stripe_checkout_session_id=session_id)
        .first()
    )

    if not payment or payment.status == Payment.STATUS_PAID:
        return payment

    payment.mark_cancelled()

    booking = (
        Booking.objects.select_for_update()
        .select_related('boat', 'renter')
        .get(pk=payment.booking_id)
    )

    if booking.status == 'awaiting_payment':
        booking.status = 'cancelled'
        booking.cancelled_by = ''
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = 'Payment checkout expired before payment was completed.'
        booking.save(update_fields=[
            'status',
            'cancelled_by',
            'cancelled_at',
            'cancellation_reason',
        ])

        Notification.objects.create(
            user=booking.renter,
            message=f'Your payment deadline for "{booking.boat.title}" expired.',
            target_url=f'/bookings/{booking.public_id}',
        )

    return payment

def expire_stripe_checkout_for_booking(booking):
 
    payment = Payment.objects.filter(booking=booking).first()
    if not payment or not payment.stripe_checkout_session_id:
        return

    if payment.status not in (Payment.STATUS_CHECKOUT_CREATED, Payment.STATUS_NOT_STARTED):
        return

    try:
        stripe.api_key = get_stripe_api_key()
    except StripeNotConfiguredError:
        return

    try:
        stripe.checkout.Session.expire(payment.stripe_checkout_session_id)
    except stripe.StripeError:
        logger.warning(
            'Could not expire Stripe Checkout Session %s for cancelled booking %s.',
            payment.stripe_checkout_session_id,
            booking.public_id,
            exc_info=True,
        )
        return

    payment.mark_cancelled()
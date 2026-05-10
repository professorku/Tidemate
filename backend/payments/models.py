from django.db import models
from django.db.models import Q
from django.utils import timezone

from bookings.models import Booking


class Payment(models.Model):
    STATUS_NOT_STARTED = 'not_started'
    STATUS_CHECKOUT_CREATED = 'checkout_created'
    STATUS_PAID = 'paid'
    STATUS_FAILED = 'failed'
    STATUS_REFUNDED = 'refunded'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_NOT_STARTED, 'Not started'),
        (STATUS_CHECKOUT_CREATED, 'Checkout created'),
        (STATUS_PAID, 'Paid'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_REFUNDED, 'Refunded'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    PROVIDER_STRIPE = 'stripe'

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='payment',
    )
    provider = models.CharField(max_length=20, default=PROVIDER_STRIPE)
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=STATUS_NOT_STARTED,
        db_index=True,
    )

    amount_ore = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default='nok')

    stripe_checkout_session_id = models.CharField(
        max_length=255,
        blank=True,
        unique=True,
        null=True,
    )
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)

    paid_at = models.DateTimeField(blank=True, null=True)
    failed_at = models.DateTimeField(blank=True, null=True)
    refunded_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', 'status'], name='payment_booking_status_idx'),
            models.Index(fields=['status', '-created_at'], name='payment_status_created_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(amount_ore__gt=0),
                name='payment_amount_positive',
            ),
        ]

    def __str__(self):
        return f'{self.booking.public_id} · {self.status} · {self.amount_ore} {self.currency}'

    def mark_checkout_created(self, *, checkout_session_id, payment_intent_id='', customer_id=''):
        self.status = self.STATUS_CHECKOUT_CREATED
        self.stripe_checkout_session_id = checkout_session_id
        self.stripe_payment_intent_id = payment_intent_id or ''
        self.stripe_customer_id = customer_id or ''
        self.save(update_fields=[
            'status',
            'stripe_checkout_session_id',
            'stripe_payment_intent_id',
            'stripe_customer_id',
            'updated_at',
        ])

    def mark_paid(self, *, payment_intent_id='', customer_id=''):
        self.status = self.STATUS_PAID
        self.paid_at = self.paid_at or timezone.now()

        if payment_intent_id:
            self.stripe_payment_intent_id = payment_intent_id
        if customer_id:
            self.stripe_customer_id = customer_id

        self.save(update_fields=[
            'status',
            'paid_at',
            'stripe_payment_intent_id',
            'stripe_customer_id',
            'updated_at',
        ])

    def mark_cancelled(self):
        self.status = self.STATUS_CANCELLED
        self.cancelled_at = self.cancelled_at or timezone.now()
        self.save(update_fields=['status', 'cancelled_at', 'updated_at'])

    def mark_failed(self):
        self.status = self.STATUS_FAILED
        self.failed_at = self.failed_at or timezone.now()
        self.save(update_fields=['status', 'failed_at', 'updated_at'])


class StripeEvent(models.Model):

    event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=100, blank=True)
    received_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-received_at']

    def __str__(self):
        return f'{self.event_type} {self.event_id}'
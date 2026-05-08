from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'booking',
        'status',
        'amount_ore',
        'currency',
        'stripe_checkout_session_id',
        'paid_at',
        'created_at',
    )
    list_filter = ('status', 'currency', 'created_at', 'paid_at')
    search_fields = (
        'booking__public_id',
        'stripe_checkout_session_id',
        'stripe_payment_intent_id',
        'stripe_customer_id',
    )
    readonly_fields = (
        'created_at',
        'updated_at',
        'paid_at',
        'failed_at',
        'cancelled_at',
        'refunded_at',
    )
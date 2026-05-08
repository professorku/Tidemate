from rest_framework import serializers

from .models import Payment


class PaymentReadSerializer(serializers.ModelSerializer):
    booking_public_id = serializers.CharField(source='booking.public_id', read_only=True)
    booking_status = serializers.CharField(source='booking.status', read_only=True)
    amount = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'booking',
            'booking_public_id',
            'booking_status',
            'provider',
            'status',
            'amount',
            'amount_ore',
            'currency',
            'stripe_checkout_session_id',
            'paid_at',
            'failed_at',
            'cancelled_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_amount(self, obj):
        return f'{obj.amount_ore / 100:.2f}'
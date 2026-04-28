from datetime import date

from rest_framework import serializers

from .creation import create_pending_booking
from .models import Booking, MAX_BOOKING_CANCELLATION_REASON_LENGTH


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'boat', 'start_date', 'end_date', 'total_price']
        read_only_fields = ['id', 'total_price']

    def validate(self, attrs):
        boat = attrs.get('boat')
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if not boat:
            raise serializers.ValidationError({'boat': ['Boat is required.']})

        request = self.context.get('request')

        if request is None or not request.user.is_authenticated:
            raise serializers.ValidationError({
                'detail': ['You must be logged in to create a booking.']
            })

        if boat.host_id == request.user.id:
            raise serializers.ValidationError({
                'boat': ['You cannot book your own boat.']
            })

        if not start_date or not end_date:
            raise serializers.ValidationError({
                'detail': ['Start date and end date are required.']
            })

        if end_date < start_date:
            raise serializers.ValidationError({
                'end_date': ['End date must be after start date.']
            })

        if start_date < date.today():
            raise serializers.ValidationError({
                'start_date': ['You cannot book dates in the past.']
            })

        return attrs

    def create(self, validated_data):
        return create_pending_booking(
            renter=self.context['request'].user,
            **validated_data,
        )


class BookingCancelSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=MAX_BOOKING_CANCELLATION_REASON_LENGTH,
        trim_whitespace=True,
    )

    def validate_reason(self, value):
        return (value or '').strip()
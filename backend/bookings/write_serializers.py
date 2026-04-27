from datetime import date

from rest_framework import serializers

from .creation import create_pending_booking
from .models import Booking


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

        if not start_date or not end_date:
            raise serializers.ValidationError('Start date and end date are required.')

        if end_date < start_date:
            raise serializers.ValidationError('End date must be after start date.')

        if start_date < date.today():
            raise serializers.ValidationError('You cannot book dates in the past.')

        return attrs

    def create(self, validated_data):
        return create_pending_booking(
            renter=self.context['request'].user,
            **validated_data,
        )


class BookingCancelSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_reason(self, value):
        return (value or '').strip()

from rest_framework import serializers

from .models import Booking
from .representation_helpers import BookingRepresentationMixin


BOOKING_READ_ONLY_FIELDS = [
    'id',
    'boat_title',
    'boat_image',
    'boat_location',
    'boat_type',
    'boat_guests',
    'price_per_day',
    'host_username',
    'host_id',
    'latitude',
    'longitude',
    'approximate_latitude',
    'approximate_longitude',
    'exact_location_available',
    'location_precision',
    'location_radius_km',
    'location_disclosure_message',
    'renter',
    'renter_id',
    'renter_username',
    'renter_avatar',
    'pickup_datetime',
    'return_datetime',
    'duration_days',
    'rental_policy',
    'cancellation_policy',
    'total_price',
    'status',
    'expires_at',
    'lifecycle_stage',
    'trip_finished',
    'conversation_id',
    'can_confirm',
    'can_cancel',
    'review_target_name',
    'review_target_role',
    'can_review_boat',
    'can_review_user',
    'viewer_boat_review',
    'viewer_user_review',
    'cancellation_reason',
    'cancelled_by',
    'cancelled_at',
    'created_at',
]


class BookingReadSerializer(BookingRepresentationMixin, serializers.ModelSerializer):
    renter_username = serializers.CharField(source='renter.username', read_only=True)
    renter_id = serializers.IntegerField(source='renter.id', read_only=True)
    renter_avatar = serializers.SerializerMethodField()

    boat_title = serializers.CharField(source='boat.title', read_only=True)
    boat_image = serializers.SerializerMethodField()
    boat_location = serializers.CharField(source='boat.location_name', read_only=True)
    boat_type = serializers.CharField(source='boat.boat_type', read_only=True)
    boat_guests = serializers.IntegerField(source='boat.guests', read_only=True)
    price_per_day = serializers.DecimalField(
        source='boat.price_per_day',
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    host_username = serializers.CharField(source='boat.host.username', read_only=True)
    host_id = serializers.IntegerField(source='boat.host.id', read_only=True)

    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    approximate_latitude = serializers.SerializerMethodField()
    approximate_longitude = serializers.SerializerMethodField()
    exact_location_available = serializers.SerializerMethodField()
    location_precision = serializers.SerializerMethodField()
    location_radius_km = serializers.SerializerMethodField()
    location_disclosure_message = serializers.SerializerMethodField()

    duration_days = serializers.SerializerMethodField()
    rental_policy = serializers.SerializerMethodField()
    cancellation_policy = serializers.SerializerMethodField()
    can_confirm = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    pickup_datetime = serializers.SerializerMethodField()
    return_datetime = serializers.SerializerMethodField()
    lifecycle_stage = serializers.SerializerMethodField()
    trip_finished = serializers.SerializerMethodField()
    conversation_id = serializers.SerializerMethodField()
    review_target_name = serializers.SerializerMethodField()
    review_target_role = serializers.SerializerMethodField()
    can_review_boat = serializers.SerializerMethodField()
    can_review_user = serializers.SerializerMethodField()
    viewer_boat_review = serializers.SerializerMethodField()
    viewer_user_review = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'boat',
            'boat_title',
            'boat_image',
            'boat_location',
            'boat_type',
            'boat_guests',
            'price_per_day',
            'host_username',
            'host_id',
            'latitude',
            'longitude',
            'approximate_latitude',
            'approximate_longitude',
            'exact_location_available',
            'location_precision',
            'location_radius_km',
            'location_disclosure_message',
            'renter',
            'renter_id',
            'renter_username',
            'renter_avatar',
            'start_date',
            'end_date',
            'pickup_datetime',
            'return_datetime',
            'duration_days',
            'rental_policy',
            'cancellation_policy',
            'total_price',
            'status',
            'expires_at',
            'lifecycle_stage',
            'trip_finished',
            'conversation_id',
            'can_confirm',
            'can_cancel',
            'review_target_name',
            'review_target_role',
            'can_review_boat',
            'can_review_user',
            'viewer_boat_review',
            'viewer_user_review',
            'cancellation_reason',
            'cancelled_by',
            'cancelled_at',
            'created_at',
        ]
        read_only_fields = BOOKING_READ_ONLY_FIELDS
from rest_framework import serializers

from config.booking_policy import build_booking_policy, build_cancellation_policy

from .image_serializers import BoatImageSerializer
from .models import BoatListing
from .services.booking_ranges import get_blocked_ranges
from .services.location_privacy import build_location_privacy_payload


class BoatListingReadMethodsMixin:
    def _get_request_user(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return user if user and user.is_authenticated else None

    def get_host_name(self, obj):
        user = getattr(obj, 'host', None)

        if not user:
            return 'Host'

        profile = getattr(user, 'profile', None)
        display_name = getattr(profile, 'display_name', '') if profile else ''

        return (display_name or user.username or 'Host').strip()

    def _get_location_payload(self, obj):
        cache_key = '_tidemate_location_privacy_payload'
        cached_payload = getattr(obj, cache_key, None)

        if cached_payload is not None:
            return cached_payload

        payload = build_location_privacy_payload(obj, self._get_request_user())
        setattr(obj, cache_key, payload)
        return payload

    def get_latitude(self, obj):
        return self._get_location_payload(obj)['latitude']

    def get_longitude(self, obj):
        return self._get_location_payload(obj)['longitude']

    def get_pickup_address(self, obj):
        return self._get_location_payload(obj)['pickup_address']

    def get_pickup_instructions(self, obj):
        return self._get_location_payload(obj)['pickup_instructions']

    def get_approximate_latitude(self, obj):
        return self._get_location_payload(obj)['approximate_latitude']

    def get_approximate_longitude(self, obj):
        return self._get_location_payload(obj)['approximate_longitude']

    def get_exact_location_available(self, obj):
        return self._get_location_payload(obj)['exact_location_available']

    def get_location_precision(self, obj):
        return self._get_location_payload(obj)['location_precision']

    def get_location_radius_km(self, obj):
        return self._get_location_payload(obj)['location_radius_km']

    def get_location_disclosure_message(self, obj):
        return self._get_location_payload(obj)['location_disclosure_message']

    def get_image(self, obj):
        image = obj.image
        if not image:
            return None

        return image.url

    def get_thumbnail(self, obj):
        thumbnail = obj.thumbnail
        if thumbnail:
            return thumbnail.url

        image = obj.image
        if image:
            return image.url

        return None

    def get_rental_policy(self, obj):
        return build_booking_policy()

    def get_cancellation_policy(self, obj):
        return build_cancellation_policy()

    def get_distance_km(self, obj):
        return getattr(obj, 'distance_km', None)

    def get_is_favorited(self, obj):
        return bool(getattr(obj, 'is_favorited', False))

    def get_favorite_id(self, obj):
        return getattr(obj, 'favorite_id', None)

    def get_blocked_ranges(self, obj):
        return get_blocked_ranges(obj)


class BoatListingReadMixin(BoatListingReadMethodsMixin, serializers.Serializer):
    host_name = serializers.SerializerMethodField()
    host_id = serializers.IntegerField(source='host.id', read_only=True)

    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    images = BoatImageSerializer(many=True, read_only=True)

    blocked_ranges = serializers.SerializerMethodField()
    rental_policy = serializers.SerializerMethodField()
    cancellation_policy = serializers.SerializerMethodField()

    distance_km = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    favorite_id = serializers.SerializerMethodField()

    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    pickup_address = serializers.SerializerMethodField()
    pickup_instructions = serializers.SerializerMethodField()

    approximate_latitude = serializers.SerializerMethodField()
    approximate_longitude = serializers.SerializerMethodField()
    exact_location_available = serializers.SerializerMethodField()
    location_precision = serializers.SerializerMethodField()
    location_radius_km = serializers.SerializerMethodField()
    location_disclosure_message = serializers.SerializerMethodField()


class BoatListingPublicSerializer(BoatListingReadMixin, serializers.ModelSerializer):

    class Meta:
        model = BoatListing
        fields = [
            'id',
            'title',
            'description',
            'boat_type',
            'location_name',
            'pickup_address',
            'pickup_instructions',
            'latitude',
            'longitude',
            'approximate_latitude',
            'approximate_longitude',
            'exact_location_available',
            'location_precision',
            'location_radius_km',
            'location_disclosure_message',
            'guests',
            'price_per_day',
            'image',
            'thumbnail',
            'images',
            'host_id',
            'host_name',
            'blocked_ranges',
            'rental_policy',
            'cancellation_policy',
            'distance_km',
            'is_favorited',
            'favorite_id',
            'created_at',
        ]
        read_only_fields = fields


class BoatListingOwnerSerializer(BoatListingReadMixin, serializers.ModelSerializer):

    class Meta:
        model = BoatListing
        fields = [
            'id',
            'title',
            'description',
            'boat_type',
            'location_name',
            'pickup_address',
            'pickup_instructions',
            'latitude',
            'longitude',
            'approximate_latitude',
            'approximate_longitude',
            'exact_location_available',
            'location_precision',
            'location_radius_km',
            'location_disclosure_message',
            'guests',
            'price_per_day',
            'image',
            'thumbnail',
            'images',
            'host_id',
            'host_name',
            'blocked_ranges',
            'rental_policy',
            'cancellation_policy',
            'distance_km',
            'is_favorited',
            'favorite_id',
            'created_at',
        ]
        read_only_fields = fields
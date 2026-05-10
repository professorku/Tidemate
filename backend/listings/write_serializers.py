from rest_framework import serializers

from .image_serializers import BoatImageSerializer
from .models import BoatListing
from .read_serializers import BoatListingReadMethodsMixin
from .write_mixins import BoatListingWriteMixin


class BoatListingWriteSerializer(BoatListingWriteMixin, serializers.ModelSerializer):

    class Meta:
        model = BoatListing
        fields = [
            'title',
            'description',
            'boat_type',
            'location_name',
            'pickup_address',
            'pickup_instructions',
            'latitude',
            'longitude',
            'guests',
            'price_per_day',
            'new_images',
            'cover_index',
            'cover_image_id',
            'remove_image_ids',
        ]


class BoatListingOwnerWriteSerializer(
    BoatListingReadMethodsMixin,
    BoatListingWriteMixin,
    serializers.ModelSerializer,
):

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

    approximate_latitude = serializers.SerializerMethodField()
    approximate_longitude = serializers.SerializerMethodField()
    exact_location_available = serializers.SerializerMethodField()
    location_precision = serializers.SerializerMethodField()
    location_radius_km = serializers.SerializerMethodField()
    location_disclosure_message = serializers.SerializerMethodField()

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
            'new_images',
            'cover_index',
            'cover_image_id',
            'remove_image_ids',
        ]
        read_only_fields = [
            'id',
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
            'approximate_latitude',
            'approximate_longitude',
            'exact_location_available',
            'location_precision',
            'location_radius_km',
            'location_disclosure_message',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        location_payload = self._get_location_payload(instance)

        data['latitude'] = location_payload['latitude']
        data['longitude'] = location_payload['longitude']
        data['pickup_address'] = location_payload['pickup_address']
        data['pickup_instructions'] = location_payload['pickup_instructions']
        data['approximate_latitude'] = location_payload['approximate_latitude']
        data['approximate_longitude'] = location_payload['approximate_longitude']
        data['exact_location_available'] = location_payload['exact_location_available']
        data['location_precision'] = location_payload['location_precision']
        data['location_radius_km'] = location_payload['location_radius_km']
        data['location_disclosure_message'] = location_payload['location_disclosure_message']

        return data


class BoatListingSerializer(BoatListingOwnerWriteSerializer):
    """
    Old serializer name kept for backwards compatibility with existing tests and
    older imports.
    """

    pass
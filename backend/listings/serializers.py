from django.db import transaction
from rest_framework import serializers

from config.booking_policy import build_booking_policy, build_cancellation_policy
from config.uploads import (
    MAX_BOAT_IMAGE_COUNT,
    MAX_BOAT_IMAGE_SIZE_BYTES,
    validate_image_upload_list,
)

from .models import (
    BoatListing,
    BoatImage,
    MAX_BOAT_GUESTS,
    MAX_LATITUDE,
    MAX_LISTING_TITLE_LENGTH,
    MAX_LOCATION_NAME_LENGTH,
    MAX_LONGITUDE,
    MAX_PICKUP_ADDRESS_LENGTH,
    MAX_PICKUP_INSTRUCTIONS_LENGTH,
    MAX_PRICE_PER_DAY,
    MIN_BOAT_GUESTS,
    MIN_LATITUDE,
    MIN_LISTING_TITLE_LENGTH,
    MIN_LOCATION_NAME_LENGTH,
    MIN_LONGITUDE,
    MIN_PRICE_PER_DAY,
)
from .services.listing_images import (
    set_cover_by_index,
    set_cover_by_id,
    sync_cover_image_field,
)
from .services.booking_ranges import get_blocked_ranges
from .services.location_privacy import build_location_privacy_payload


class BoatImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = BoatImage
        fields = ['id', 'image', 'is_cover', 'sort_order']
        read_only_fields = ['id']

    def get_image(self, obj):
        if not obj.image:
            return None

        return obj.image.url


class BoatListingReadMethodsMixin:
    def _get_request_user(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return user if user and user.is_authenticated else None

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
    host_name = serializers.CharField(source='host.username', read_only=True)
    host_id = serializers.IntegerField(source='host.id', read_only=True)

    image = serializers.SerializerMethodField()
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


class BoatListingWriteMixin(serializers.Serializer):
    new_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )
    cover_index = serializers.IntegerField(write_only=True, required=False)
    cover_image_id = serializers.IntegerField(write_only=True, required=False)
    remove_image_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )

    def validate_title(self, value):
        title = (value or '').strip()

        if len(title) < MIN_LISTING_TITLE_LENGTH:
            raise serializers.ValidationError(
                f'Title must be at least {MIN_LISTING_TITLE_LENGTH} characters.'
            )

        if len(title) > MAX_LISTING_TITLE_LENGTH:
            raise serializers.ValidationError(
                f'Title cannot exceed {MAX_LISTING_TITLE_LENGTH} characters.'
            )

        return title

    def validate_description(self, value):
        description = (value or '').strip()

        if len(description) < 20:
            raise serializers.ValidationError('Description should be at least 20 characters.')

        if len(description) > 2000:
            raise serializers.ValidationError('Description cannot exceed 2000 characters.')

        return description

    def validate_location_name(self, value):
        location_name = (value or '').strip()

        if len(location_name) < MIN_LOCATION_NAME_LENGTH:
            raise serializers.ValidationError(
                f'Public location must be at least {MIN_LOCATION_NAME_LENGTH} characters.'
            )

        if len(location_name) > MAX_LOCATION_NAME_LENGTH:
            raise serializers.ValidationError(
                f'Public location cannot exceed {MAX_LOCATION_NAME_LENGTH} characters.'
            )

        return location_name

    def validate_pickup_address(self, value):
        pickup_address = (value or '').strip()

        if len(pickup_address) > MAX_PICKUP_ADDRESS_LENGTH:
            raise serializers.ValidationError(
                f'Pickup address cannot exceed {MAX_PICKUP_ADDRESS_LENGTH} characters.'
            )

        return pickup_address

    def validate_pickup_instructions(self, value):
        pickup_instructions = (value or '').strip()

        if len(pickup_instructions) > MAX_PICKUP_INSTRUCTIONS_LENGTH:
            raise serializers.ValidationError(
                f'Pickup instructions cannot exceed {MAX_PICKUP_INSTRUCTIONS_LENGTH} characters.'
            )

        return pickup_instructions

    def validate_guests(self, value):
        if value < MIN_BOAT_GUESTS:
            raise serializers.ValidationError(
                f'Guests must be at least {MIN_BOAT_GUESTS}.'
            )

        if value > MAX_BOAT_GUESTS:
            raise serializers.ValidationError(
                f'Guests cannot exceed {MAX_BOAT_GUESTS}.'
            )

        return value

    def validate_price_per_day(self, value):
        if value < MIN_PRICE_PER_DAY:
            raise serializers.ValidationError(
                f'Price per day must be at least {MIN_PRICE_PER_DAY}.'
            )

        if value > MAX_PRICE_PER_DAY:
            raise serializers.ValidationError(
                f'Price per day cannot exceed {MAX_PRICE_PER_DAY}.'
            )

        return value

    def validate_latitude(self, value):
        if value is None:
            return value

        if value < MIN_LATITUDE or value > MAX_LATITUDE:
            raise serializers.ValidationError('Latitude must be between -90 and 90.')

        return value

    def validate_longitude(self, value):
        if value is None:
            return value

        if value < MIN_LONGITUDE or value > MAX_LONGITUDE:
            raise serializers.ValidationError('Longitude must be between -180 and 180.')

        return value

    def validate_cover_index(self, value):
        if value < 0:
            raise serializers.ValidationError('Cover index must be 0 or higher.')

        return value

    def validate_new_images(self, value):
        return validate_image_upload_list(
            value,
            field_label='Boat images',
            max_count=MAX_BOAT_IMAGE_COUNT,
            max_size_bytes=MAX_BOAT_IMAGE_SIZE_BYTES,
        )

    def validate(self, attrs):
        attrs = super().validate(attrs)

        remove_image_ids = attrs.get('remove_image_ids') or []
        new_images = attrs.get('new_images') or []

        if self.instance:
            existing_count = self.instance.images.count()
            unique_remove_ids = set(remove_image_ids)

            matching_remove_ids = set(
                self.instance.images
                .filter(id__in=unique_remove_ids)
                .values_list('id', flat=True)
            )

            invalid_remove_ids = unique_remove_ids - matching_remove_ids

            if invalid_remove_ids:
                raise serializers.ValidationError({
                    'remove_image_ids': [
                        'One or more images do not belong to this boat listing.'
                    ]
                })

            resulting_count = existing_count - len(matching_remove_ids) + len(new_images)

            if resulting_count > MAX_BOAT_IMAGE_COUNT:
                raise serializers.ValidationError({
                    'new_images': [
                        f'A boat listing can have at most {MAX_BOAT_IMAGE_COUNT} images in total.'
                    ]
                })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        new_images = validated_data.pop('new_images', [])
        cover_index = validated_data.pop('cover_index', 0 if new_images else None)
        validated_data.pop('cover_image_id', None)
        validated_data.pop('remove_image_ids', None)

        request = self.context['request']
        boat = BoatListing.objects.create(host=request.user, **validated_data)

        created_ids = []

        for idx, image_file in enumerate(new_images):
            image = BoatImage.objects.create(
                boat=boat,
                image=image_file,
                is_cover=False,
                sort_order=idx,
            )
            created_ids.append(image.id)

        if created_ids:
            try:
                set_cover_by_index(boat, cover_index, created_ids)
            except ValueError as exc:
                raise serializers.ValidationError({
                    'cover_index': [str(exc)]
                })
        else:
            sync_cover_image_field(boat)

        return boat

    @transaction.atomic
    def update(self, instance, validated_data):
        new_images = validated_data.pop('new_images', [])
        cover_index = validated_data.pop('cover_index', None)
        cover_image_id = validated_data.pop('cover_image_id', None)
        remove_image_ids = validated_data.pop('remove_image_ids', [])

        unique_remove_ids = set(remove_image_ids)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if unique_remove_ids:
            instance.images.filter(id__in=unique_remove_ids).delete()

        current_max_sort = instance.images.order_by('-sort_order').first()
        next_sort = (current_max_sort.sort_order + 1) if current_max_sort else 0

        created_ids = []

        for image_file in new_images:
            image = BoatImage.objects.create(
                boat=instance,
                image=image_file,
                is_cover=False,
                sort_order=next_sort,
            )
            created_ids.append(image.id)
            next_sort += 1

        try:
            if created_ids and cover_index is not None:
                set_cover_by_index(instance, cover_index, created_ids)
            elif cover_image_id is not None:
                set_cover_by_id(instance, cover_image_id)

            sync_cover_image_field(instance)

        except ValueError as exc:
            field_name = 'cover_index' if 'index' in str(exc).lower() else 'cover_image_id'
            raise serializers.ValidationError({
                field_name: [str(exc)]
            })

        return instance


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

    host_name = serializers.CharField(source='host.username', read_only=True)
    host_id = serializers.IntegerField(source='host.id', read_only=True)

    image = serializers.SerializerMethodField()
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
from django.db import transaction
from rest_framework import serializers

from config.booking_policy import build_booking_policy, build_cancellation_policy
from config.uploads import (
    MAX_BOAT_IMAGE_COUNT,
    MAX_BOAT_IMAGE_SIZE_BYTES,
    validate_image_upload_list,
)

from .models import BoatListing, BoatImage
from .services.listing_images import (
    set_cover_by_index,
    set_cover_by_id,
    sync_cover_image_field,
)
from .services.booking_ranges import get_blocked_ranges


class BoatImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoatImage
        fields = ['id', 'image', 'is_cover', 'sort_order']
        read_only_fields = ['id']


class BoatListingSerializer(serializers.ModelSerializer):
    host_name = serializers.CharField(source='host.username', read_only=True)
    host_id = serializers.IntegerField(source='host.id', read_only=True)
    image = serializers.SerializerMethodField()
    blocked_ranges = serializers.SerializerMethodField()
    rental_policy = serializers.SerializerMethodField()
    cancellation_policy = serializers.SerializerMethodField()
    images = BoatImageSerializer(many=True, read_only=True)
    distance_km = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    favorite_id = serializers.SerializerMethodField()

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

    class Meta:
        model = BoatListing
        fields = [
            'id',
            'title',
            'description',
            'boat_type',
            'location_name',
            'latitude',
            'longitude',
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
            'host_id',
            'host_name',
            'image',
            'images',
            'blocked_ranges',
            'rental_policy',
            'cancellation_policy',
            'distance_km',
            'is_favorited',
            'favorite_id',
            'created_at',
        ]

    def get_image(self, obj):
        image = obj.image
        if not image:
            return None

        request = self.context.get('request')
        url = image.url
        return request.build_absolute_uri(url) if request else url

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

    def validate_description(self, value):
        description = (value or '').strip()

        if len(description) < 20:
            raise serializers.ValidationError('Description should be at least 20 characters.')

        if len(description) > 2000:
            raise serializers.ValidationError('Description cannot exceed 2000 characters.')

        return description

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
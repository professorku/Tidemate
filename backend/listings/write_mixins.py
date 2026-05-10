from django.db import transaction
from rest_framework import serializers

from config.uploads import (
    MAX_BOAT_IMAGE_COUNT,
    MAX_BOAT_IMAGE_SIZE_BYTES,
    create_image_thumbnail,
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
from .services.location_privacy import get_public_location_text_privacy_error


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

    def _validate_public_location_text(self, value):
        privacy_error = get_public_location_text_privacy_error(value)

        if privacy_error:
            raise serializers.ValidationError(privacy_error)

        return value

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

        return self._validate_public_location_text(title)

    def validate_description(self, value):
        description = (value or '').strip()

        if len(description) < 20:
            raise serializers.ValidationError('Description should be at least 20 characters.')

        if len(description) > 2000:
            raise serializers.ValidationError('Description cannot exceed 2000 characters.')

        return self._validate_public_location_text(description)

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

        return self._validate_public_location_text(location_name)

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
        cover_index = attrs.get('cover_index', None)
        cover_image_id = attrs.get('cover_image_id', None)

        unique_remove_ids = set(remove_image_ids)

        if cover_index is not None and cover_image_id is not None:
            raise serializers.ValidationError({
                'cover_index': [
                    'Choose either a newly uploaded cover image by index or an existing cover image by ID, not both.'
                ],
                'cover_image_id': [
                    'Choose either a newly uploaded cover image by index or an existing cover image by ID, not both.'
                ],
            })

        if cover_index is not None:
            if not new_images:
                raise serializers.ValidationError({
                    'cover_index': [
                        'Cover index can only be used when uploading new images.'
                    ]
                })

            if cover_index >= len(new_images):
                raise serializers.ValidationError({
                    'cover_index': [
                        'Cover index is outside the uploaded image list.'
                    ]
                })

        if not self.instance:
            if cover_image_id is not None:
                raise serializers.ValidationError({
                    'cover_image_id': [
                        'Cover image ID can only be used when updating an existing boat listing.'
                    ]
                })

            if unique_remove_ids:
                raise serializers.ValidationError({
                    'remove_image_ids': [
                        'Images can only be removed when updating an existing boat listing.'
                    ]
                })

            if len(new_images) > MAX_BOAT_IMAGE_COUNT:
                raise serializers.ValidationError({
                    'new_images': [
                        f'A boat listing can have at most {MAX_BOAT_IMAGE_COUNT} images in total.'
                    ]
                })

            return attrs

        existing_image_ids = set(
            self.instance.images.values_list('id', flat=True)
        )

        invalid_remove_ids = unique_remove_ids - existing_image_ids

        if invalid_remove_ids:
            raise serializers.ValidationError({
                'remove_image_ids': [
                    'One or more images do not belong to this boat listing.'
                ]
            })

        if cover_image_id is not None:
            if cover_image_id not in existing_image_ids:
                raise serializers.ValidationError({
                    'cover_image_id': [
                        'Cover image does not belong to this boat listing.'
                    ]
                })

            if cover_image_id in unique_remove_ids:
                raise serializers.ValidationError({
                    'cover_image_id': [
                        'Cover image cannot be one of the images being removed.'
                    ]
                })

        resulting_count = (
            len(existing_image_ids)
            - len(unique_remove_ids)
            + len(new_images)
        )

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
                thumbnail=create_image_thumbnail(image_file),
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
                thumbnail=create_image_thumbnail(image_file),
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
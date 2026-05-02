import logging
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models, transaction
from django.db.models import Q
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)

MIN_LISTING_TITLE_LENGTH = 3
MAX_LISTING_TITLE_LENGTH = 120
MIN_LOCATION_NAME_LENGTH = 2
MAX_LOCATION_NAME_LENGTH = 120

MAX_PICKUP_ADDRESS_LENGTH = 255
MAX_PICKUP_INSTRUCTIONS_LENGTH = 1000

MIN_BOAT_GUESTS = 1
MAX_BOAT_GUESTS = 100

MIN_PRICE_PER_DAY = Decimal('0.01')
MAX_PRICE_PER_DAY = Decimal('100000.00')

MIN_LATITUDE = Decimal('-90.000000')
MAX_LATITUDE = Decimal('90.000000')
MIN_LONGITUDE = Decimal('-180.000000')
MAX_LONGITUDE = Decimal('180.000000')


class BoatListing(models.Model):
    BOAT_TYPES = [
            ('rib', 'RIB'),
            ('sailboat', 'Sailboat'),
            ('kayak', 'Kayak'),
            ('yacht', 'Yacht'),
            ('motorboat', 'Motorboat'),
            ('fishing_boat', 'Fishing Boat'),
            ('rowboat', 'Rowboat'),
            ('catamaran', 'Catamaran'),
            ('canoe', 'Canoe'),
            ('other', 'Other'),
        ]

    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boat_listings')
    title = models.CharField(max_length=255)
    description = models.TextField()
    boat_type = models.CharField(max_length=20, choices=BOAT_TYPES)

    # Public area/city shown to everyone. Do not store exact dock/address here.
    location_name = models.CharField(max_length=255)

    # Exact private pickup details. Only exposed to host, staff/admin, or confirmed renter.
    pickup_address = models.CharField(max_length=MAX_PICKUP_ADDRESS_LENGTH, blank=True)
    pickup_instructions = models.TextField(blank=True)

    # Exact coordinates are private. Serializers decide whether to expose exact or approximate values.
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Public privacy-safe coordinates used for public map/radius search.
    # These are generated from exact coordinates with a deterministic offset.
    public_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        db_index=True,
        editable=False,
    )
    public_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        db_index=True,
        editable=False,
    )

    guests = models.PositiveIntegerField()
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at', '-id']
        indexes = [
            models.Index(
                fields=['public_latitude', 'public_longitude'],
                name='boat_public_geo_idx',
            ),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(guests__gte=MIN_BOAT_GUESTS) & Q(guests__lte=MAX_BOAT_GUESTS),
                name='boatlisting_guests_range',
            ),
            models.CheckConstraint(
                condition=Q(price_per_day__gte=MIN_PRICE_PER_DAY) & Q(price_per_day__lte=MAX_PRICE_PER_DAY),
                name='boatlisting_price_per_day_range',
            ),
            models.CheckConstraint(
                condition=(
                    Q(latitude__isnull=True) |
                    (Q(latitude__gte=MIN_LATITUDE) & Q(latitude__lte=MAX_LATITUDE))
                ),
                name='boatlisting_latitude_range',
            ),
            models.CheckConstraint(
                condition=(
                    Q(longitude__isnull=True) |
                    (Q(longitude__gte=MIN_LONGITUDE) & Q(longitude__lte=MAX_LONGITUDE))
                ),
                name='boatlisting_longitude_range',
            ),
        ]

    def __str__(self):
        return self.title

    def _set_public_coordinates(self):
        from .services.public_coordinates import get_public_coordinate_decimals

        public_latitude, public_longitude = get_public_coordinate_decimals(
            listing_id=self.pk,
            latitude=self.latitude,
            longitude=self.longitude,
        )

        self.public_latitude = public_latitude
        self.public_longitude = public_longitude

    def save(self, *args, **kwargs):
        creating = self.pk is None
        update_fields = kwargs.get('update_fields')

        if creating:
            super().save(*args, **kwargs)

            self._set_public_coordinates()

            BoatListing.objects.filter(pk=self.pk).update(
                public_latitude=self.public_latitude,
                public_longitude=self.public_longitude,
            )
            return

        coordinates_may_have_changed = (
            update_fields is None or
            'latitude' in update_fields or
            'longitude' in update_fields
        )

        if coordinates_may_have_changed:
            self._set_public_coordinates()

            if update_fields is not None:
                update_fields = set(update_fields)
                update_fields.update({'public_latitude', 'public_longitude'})
                kwargs['update_fields'] = update_fields

        super().save(*args, **kwargs)

    def get_cover_image_obj(self):
        prefetched = getattr(self, '_prefetched_objects_cache', {}).get('images')
        if prefetched is not None:
            ordered = sorted(prefetched, key=lambda img: (0 if img.is_cover else 1, img.sort_order, img.id))
            return ordered[0] if ordered else None

        return self.images.order_by('-is_cover', 'sort_order', 'id').first()

    @property
    def image(self):
        cover_image = self.get_cover_image_obj()
        return cover_image.image if cover_image else None


class BoatImage(models.Model):
    boat = models.ForeignKey(BoatListing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='boats/gallery/')
    is_cover = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['sort_order', 'id']
        constraints = [
            models.UniqueConstraint(
                fields=['boat'],
                condition=Q(is_cover=True),
                name='unique_cover_image_per_boat',
            )
        ]

    def __str__(self):
        return f'Image for {self.boat.title}'


def _delete_boat_image_file_after_commit(file_field):
    if not file_field:
        return

    file_name = getattr(file_field, 'name', None)
    storage = getattr(file_field, 'storage', None)

    if not file_name or storage is None:
        return

    def delete_file():
        try:
            still_used = BoatImage.objects.filter(image=file_name).exists()

            if still_used:
                return

            if storage.exists(file_name):
                storage.delete(file_name)

        except Exception:
            logger.exception("Failed to delete boat image file from storage: %s", file_name)

    transaction.on_commit(delete_file)


@receiver(post_delete, sender=BoatImage)
def delete_boat_image_file_on_row_delete(sender, instance, **kwargs):
    _delete_boat_image_file_after_commit(instance.image)


@receiver(pre_save, sender=BoatImage)
def delete_old_boat_image_file_on_replacement(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_instance = BoatImage.objects.only('image').get(pk=instance.pk)
    except BoatImage.DoesNotExist:
        return

    old_file = old_instance.image
    new_file = instance.image

    old_name = getattr(old_file, 'name', None)
    new_name = getattr(new_file, 'name', None)

    if old_name and old_name != new_name:
        _delete_boat_image_file_after_commit(old_file)
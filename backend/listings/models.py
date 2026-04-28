from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q


MIN_LISTING_TITLE_LENGTH = 3
MAX_LISTING_TITLE_LENGTH = 120
MIN_LOCATION_NAME_LENGTH = 2
MAX_LOCATION_NAME_LENGTH = 120

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
        ('other', 'Other'),
    ]

    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boat_listings')
    title = models.CharField(max_length=255)
    description = models.TextField()
    boat_type = models.CharField(max_length=20, choices=BOAT_TYPES)
    location_name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    guests = models.PositiveIntegerField()
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at', '-id']
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
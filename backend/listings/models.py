from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q


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

from django.db import models
from django.conf import settings
from listings.models import BoatListing

User = settings.AUTH_USER_MODEL


class Favorite(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites'
    )

    boat = models.ForeignKey(
        BoatListing,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ('user', 'boat')
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.user} ❤️ {self.boat.title}"
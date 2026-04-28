from urllib.parse import urlsplit

from django.db import models
from django.contrib.auth.models import User


MAX_NOTIFICATION_TARGET_URL_LENGTH = 255


def clean_notification_target_url(target_url):
    target_url = (target_url or "").strip()

    if not target_url:
        return ""

    parsed = urlsplit(target_url)

    if parsed.scheme or parsed.netloc:
        return ""

    if not target_url.startswith("/") or target_url.startswith("//"):
        return ""

    if "\\" in target_url:
        return ""

    return target_url[:MAX_NOTIFICATION_TARGET_URL_LENGTH]


class Notification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    target_url = models.CharField(
        max_length=MAX_NOTIFICATION_TARGET_URL_LENGTH,
        blank=True,
        default="",
    )

    def save(self, *args, **kwargs):
        self.target_url = clean_notification_target_url(self.target_url)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.message[:30]}"
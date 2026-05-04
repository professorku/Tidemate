from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


MAX_PROFILE_BIO_LENGTH = 1000


class DeviceSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="device_sessions")
    refresh_token_hash = models.CharField(max_length=64, unique=True, db_index=True)
    device_label = models.CharField(max_length=255, blank=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-last_used_at", "-id"]
        indexes = [
            models.Index(fields=["user", "-last_used_at", "-id"], name="device_user_recent_idx"),
            models.Index(fields=["user", "revoked_at", "expires_at"], name="device_user_active_idx"),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.device_label or 'unknown device'}"


class GoogleAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_account')
    google_sub = models.CharField(max_length=255, unique=True, db_index=True)
    email = models.EmailField(db_index=True)
    name = models.CharField(max_length=255, blank=True)
    picture_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']

    def __str__(self):
        return f'{self.user.username} - Google'


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.CharField(max_length=MAX_PROFILE_BIO_LENGTH, blank=True)
    location = models.CharField(max_length=120, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    pending_email = models.EmailField(blank=True, null=True, db_index=True)
    pending_email_requested_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    contacts = models.ManyToManyField(
        User,
        blank=True,
        related_name='crewmate_of_profiles',
    )
    blocked_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='blocked_by_profiles',
    )

    def __str__(self):
        return f"{self.user.username}'s profile"


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    Profile.objects.get_or_create(user=instance)
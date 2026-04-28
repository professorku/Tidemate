from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
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


from .device_tracking import DeviceSession
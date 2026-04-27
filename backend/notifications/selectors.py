from .models import Notification


def get_user_notifications_queryset(user):
    return Notification.objects.filter(user=user).order_by('-created_at', '-id')


def get_user_notifications_for_update(user):
    return Notification.objects.filter(user=user)

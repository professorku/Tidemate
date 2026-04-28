from django.urls import path
from .views import (
    MarkAllNotificationsReadView,
    MarkNotificationReadView,
    MyNotificationsView,
)

urlpatterns = [
    path("", MyNotificationsView.as_view()),
    path("mark-all-read/", MarkAllNotificationsReadView.as_view()),
    path("<int:pk>/read/", MarkNotificationReadView.as_view()),
]
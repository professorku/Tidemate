from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/listings/', include('listings.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/favorites/', include('favorites.urls')),
    path('api/geocoding/', include('geocoding.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/moderation/', include('moderation.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

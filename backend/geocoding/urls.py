from django.urls import path

from .views import GeocodingReverseView, GeocodingSearchView

urlpatterns = [
    path("search/", GeocodingSearchView.as_view(), name="geocoding-search"),
    path("reverse/", GeocodingReverseView.as_view(), name="geocoding-reverse"),
]
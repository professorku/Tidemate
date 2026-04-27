from django.contrib import admin
from .models import BoatListing, BoatImage


class BoatImageInline(admin.TabularInline):
    model = BoatImage
    extra = 0


@admin.register(BoatListing)
class BoatListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'host', 'boat_type', 'location_name', 'price_per_day')
    search_fields = ('title', 'location_name', 'host__username')
    list_filter = ('boat_type',)
    inlines = [BoatImageInline]


@admin.register(BoatImage)
class BoatImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'boat', 'is_cover', 'sort_order', 'created_at')
    list_filter = ('is_cover',)
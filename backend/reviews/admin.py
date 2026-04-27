from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'booking',
        'reviewer',
        'reviewed_user',
        'role',
        'rating',
        'created_at',
    )

    list_filter = (
        'role',
        'rating',
        'created_at',
    )

    search_fields = (
        'reviewer__username',
        'reviewed_user__username',
        'boat__title',
        'comment',
    )
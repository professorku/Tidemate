from django.contrib import admin
from django.utils import timezone

from .models import Report


@admin.action(description='Mark selected reports as reviewing')
def mark_reviewing(modeladmin, request, queryset):
    queryset.update(status=Report.Status.REVIEWING)


@admin.action(description='Mark selected reports as resolved')
def mark_resolved(modeladmin, request, queryset):
    queryset.update(status=Report.Status.RESOLVED, resolved_at=timezone.now())


@admin.action(description='Dismiss selected reports')
def mark_dismissed(modeladmin, request, queryset):
    queryset.update(status=Report.Status.DISMISSED, resolved_at=timezone.now())


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'target_type',
        'target_display',
        'reporter',
        'reason',
        'status',
        'created_at',
    )

    list_filter = (
        'target_type',
        'reason',
        'status',
        'created_at',
    )

    search_fields = (
        'reporter__username',
        'reporter__email',
        'listing__title',
        'reported_user__username',
        'reported_user__email',
        'review__comment',
        'review__reviewer__username',
        'message__text',
        'message__sender__username',
        'details',
        'admin_notes',
    )

    readonly_fields = (
        'created_at',
        'updated_at',
    )

    actions = [
        mark_reviewing,
        mark_resolved,
        mark_dismissed,
    ]

    fieldsets = (
        ('Report', {
            'fields': (
                'reporter',
                'target_type',
                'listing',
                'reported_user',
                'review',
                'message',
                'reason',
                'details',
            ),
        }),
        ('Moderation', {
            'fields': (
                'status',
                'admin_notes',
                'resolved_at',
            ),
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            ),
        }),
    )

    def target_display(self, obj):
        if obj.target_type == Report.TargetType.LISTING and obj.listing_id:
            return obj.listing.title

        if obj.target_type == Report.TargetType.USER and obj.reported_user_id:
            return obj.reported_user.username

        if obj.target_type == Report.TargetType.REVIEW and obj.review_id:
            return f'Review by {obj.review.reviewer.username}'

        if obj.target_type == Report.TargetType.MESSAGE and obj.message_id:
            return f'Message from {obj.message.sender.username}'

        return '-'

    target_display.short_description = 'Target'
from django.db.models import Avg, Count

from .models import Review


REVIEW_SELECT_RELATED_FIELDS = (
    'reviewer',
    'reviewed_user',
    'boat',
    'booking',
)


def get_boat_reviews_queryset(boat_id):
    return Review.objects.filter(
        boat_id=boat_id,
        review_type=Review.REVIEW_TYPE_BOAT,
    ).select_related(*REVIEW_SELECT_RELATED_FIELDS).order_by('-created_at', '-id')


def get_user_reviews_queryset(user_id):
    return Review.objects.filter(
        reviewed_user_id=user_id,
        review_type=Review.REVIEW_TYPE_USER,
    ).select_related(*REVIEW_SELECT_RELATED_FIELDS).order_by('-created_at', '-id')


def get_review_stats(queryset):
    stats = queryset.aggregate(
        average_rating=Avg('rating'),
        review_count=Count('id'),
    )
    return {
        'average_rating': round(stats['average_rating'], 2) if stats['average_rating'] else None,
        'review_count': stats['review_count'],
    }

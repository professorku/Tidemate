# backend/listings/queryset_utils.py
from django.db.models import BooleanField, Exists, OuterRef, Subquery, Value
from favorites.models import Favorite


def annotate_favorite_fields(queryset, user):
    if user.is_authenticated:
        favorite_queryset = Favorite.objects.filter(user=user, boat=OuterRef("pk"))
        return queryset.annotate(
            is_favorited=Exists(favorite_queryset),
            favorite_id=Subquery(favorite_queryset.values("id")[:1]),
        )

    return queryset.annotate(
        is_favorited=Value(False, output_field=BooleanField()),
    )
from django.db import IntegrityError, transaction
from rest_framework import serializers


def create_favorite(*, serializer, user):
    try:
        with transaction.atomic():
            return serializer.save(user=user)

    except IntegrityError:
        raise serializers.ValidationError({
            'boat_id': ['This boat is already in your favorites.']
        })
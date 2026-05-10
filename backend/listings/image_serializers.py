from rest_framework import serializers

from .models import BoatImage


class BoatImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = BoatImage
        fields = ['id', 'image', 'thumbnail', 'is_cover', 'sort_order']
        read_only_fields = ['id']

    def get_image(self, obj):
        if not obj.image:
            return None

        return obj.image.url

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url

        if obj.image:
            return obj.image.url

        return None
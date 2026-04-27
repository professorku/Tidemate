from rest_framework import serializers

from listings.models import BoatListing
from listings.serializers import BoatListingSerializer
from .models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    boat = serializers.SerializerMethodField(read_only=True)
    boat_id = serializers.PrimaryKeyRelatedField(
        queryset=BoatListing.objects.all(),
        source='boat',
        write_only=True,
    )

    class Meta:
        model = Favorite
        fields = ['id', 'boat', 'boat_id', 'created_at']
        read_only_fields = ['id', 'boat', 'created_at']

    def get_boat(self, obj):
        data = BoatListingSerializer(obj.boat, context=self.context).data
        data['is_favorited'] = True
        data['favorite_id'] = obj.id
        return data

    def validate(self, attrs):
        request = self.context['request']
        boat = attrs['boat']

        if Favorite.objects.filter(user=request.user, boat=boat).exists():
            raise serializers.ValidationError({
                'boat_id': 'This boat is already in your favorites.'
            })

        return attrs
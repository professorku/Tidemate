from rest_framework import serializers

from config.uploads import MAX_AVATAR_IMAGE_SIZE_BYTES, validate_image_upload

from .models import Profile


class BaseProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    member_since = serializers.DateTimeField(source='user.date_joined', read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'username',
            'bio',
            'location',
            'avatar',
            'member_since',
        ]
        read_only_fields = ['username', 'member_since', 'avatar']

    def get_avatar(self, obj):
        if not obj.avatar:
            return None

        request = self.context.get('request')
        url = obj.avatar.url

        if request is not None:
            return request.build_absolute_uri(url)

        return url


class PublicProfileSerializer(BaseProfileSerializer):
    pass


class MyProfileSerializer(BaseProfileSerializer):
    email = serializers.EmailField(source='user.email')
    avatar_upload = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta(BaseProfileSerializer.Meta):
        fields = BaseProfileSerializer.Meta.fields[:2] + [
            'email',
        ] + BaseProfileSerializer.Meta.fields[2:4] + [
            'avatar_upload',
        ] + BaseProfileSerializer.Meta.fields[4:]

    def validate_avatar_upload(self, value):
        return validate_image_upload(
            value,
            field_label='Avatar image',
            max_size_bytes=MAX_AVATAR_IMAGE_SIZE_BYTES,
        )

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        avatar_file = validated_data.pop('avatar_upload', None)

        email = user_data.get('email')
        if email is not None:
            instance.user.email = email
            instance.user.save()

        if avatar_file is not None:
            instance.avatar = avatar_file

        instance.bio = validated_data.get('bio', instance.bio)
        instance.location = validated_data.get('location', instance.location)
        instance.save()

        return instance

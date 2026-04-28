from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from config.uploads import MAX_AVATAR_IMAGE_SIZE_BYTES, validate_image_upload

from .email_verification import (
    send_email_change_security_alert_email,
    send_email_change_verification_email,
)
from .models import Profile, MAX_PROFILE_BIO_LENGTH


User = get_user_model()


class BaseProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    member_since = serializers.DateTimeField(source='user.date_joined', read_only=True)
    bio = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=MAX_PROFILE_BIO_LENGTH,
        trim_whitespace=True,
    )
    location = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=120,
        trim_whitespace=True,
    )
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

    def validate_bio(self, value):
        return (value or '').strip()

    def validate_location(self, value):
        return (value or '').strip()


class PublicProfileSerializer(BaseProfileSerializer):
    pass


class MyProfileSerializer(BaseProfileSerializer):
    email = serializers.EmailField(source='user.email', required=False)
    current_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        trim_whitespace=False,
        style={'input_type': 'password'},
    )
    pending_email = serializers.EmailField(read_only=True, allow_null=True)
    pending_email_requested_at = serializers.DateTimeField(read_only=True, allow_null=True)
    email_change_pending = serializers.SerializerMethodField()
    avatar_upload = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta(BaseProfileSerializer.Meta):
        fields = BaseProfileSerializer.Meta.fields[:2] + [
            'email',
            'current_password',
            'pending_email',
            'pending_email_requested_at',
            'email_change_pending',
        ] + BaseProfileSerializer.Meta.fields[2:4] + [
            'avatar_upload',
        ] + BaseProfileSerializer.Meta.fields[4:]

    def get_email_change_pending(self, obj):
        return bool(obj.pending_email)

    def validate_avatar_upload(self, value):
        return validate_image_upload(
            value,
            field_label='Avatar image',
            max_size_bytes=MAX_AVATAR_IMAGE_SIZE_BYTES,
        )

    def validate(self, attrs):
        attrs = super().validate(attrs)

        user_data = attrs.get('user', {})
        email = user_data.get('email')
        current_password = attrs.get('current_password', '')

        if email is not None:
            normalized_email = email.strip().lower()

            if not normalized_email:
                raise serializers.ValidationError({
                    'email': ['Email cannot be empty.']
                })

            current_user = self.instance.user if self.instance else None

            if current_user is not None and current_user.email.lower() == normalized_email:
                user_data['email'] = normalized_email
                return attrs

            if current_user is not None:
                if not current_password:
                    raise serializers.ValidationError({
                        'current_password': ['Current password is required to change your email address.']
                    })

                if not current_user.check_password(current_password):
                    raise serializers.ValidationError({
                        'current_password': ['Current password is incorrect.']
                    })

            email_already_exists = User.objects.filter(
                email__iexact=normalized_email
            )

            if current_user is not None:
                email_already_exists = email_already_exists.exclude(
                    pk=current_user.pk
                )

            if email_already_exists.exists():
                raise serializers.ValidationError({
                    'email': ['A user with this email already exists.']
                })

            user_data['email'] = normalized_email

        return attrs

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        validated_data.pop('current_password', None)
        avatar_file = validated_data.pop('avatar_upload', None)

        email = user_data.get('email')
        requested_email_change = None

        if email is not None:
            normalized_email = email.strip().lower()

            if instance.user.email.lower() != normalized_email:
                instance.pending_email = normalized_email
                instance.pending_email_requested_at = timezone.now()
                requested_email_change = normalized_email

        if avatar_file is not None:
            instance.avatar = avatar_file

        instance.bio = validated_data.get('bio', instance.bio)
        instance.location = validated_data.get('location', instance.location)
        instance.save()

        if requested_email_change is not None:
            send_email_change_verification_email(
                user=instance.user,
                pending_email=requested_email_change,
            )
            send_email_change_security_alert_email(
                user=instance.user,
                pending_email=requested_email_change,
            )

        return instance
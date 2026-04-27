class ConversationRepresentationMixin:
    def _build_media_url(self, file_field):
        if not file_field:
            return None

        request = self.context.get('request')
        url = file_field.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def _build_avatar_url(self, user):
        profile = getattr(user, 'profile', None)
        if not profile or not profile.avatar:
            return None
        return self._build_media_url(profile.avatar)

    def _get_booking(self, obj):
        return getattr(obj, 'booking', None)

    def _get_boat(self, obj):
        booking = self._get_booking(obj)
        return getattr(booking, 'boat', None) if booking else None

    def get_booking_id(self, obj):
        booking = self._get_booking(obj)
        return booking.id if booking else None

    def get_boat(self, obj):
        boat = self._get_boat(obj)
        return boat.id if boat else None

    def get_boat_title(self, obj):
        boat = self._get_boat(obj)
        return boat.title if boat else 'Direct conversation'

    def get_boat_image(self, obj):
        boat = self._get_boat(obj)
        if boat and boat.image:
            return self._build_media_url(boat.image)
        return None

    def get_host_avatar(self, obj):
        return self._build_avatar_url(obj.host)

    def get_renter_avatar(self, obj):
        return self._build_avatar_url(obj.renter)

    def get_start_date(self, obj):
        booking = self._get_booking(obj)
        return booking.start_date if booking else None

    def get_end_date(self, obj):
        booking = self._get_booking(obj)
        return booking.end_date if booking else None

    def get_total_price(self, obj):
        booking = self._get_booking(obj)
        return booking.total_price if booking else None

    def get_booking_status(self, obj):
        booking = self._get_booking(obj)
        return booking.status if booking else None

    def get_last_message_text(self, obj):
        return getattr(obj, 'latest_message_text', '') or ''

    def get_last_message_at(self, obj):
        return getattr(obj, 'latest_message_at', None) or obj.created_at

    def get_unread_count(self, obj):
        return getattr(obj, 'unread_count', 0) or 0

    def get_message_count(self, obj):
        return getattr(obj, 'message_count', 0) or 0

from .read_serializers import BOOKING_READ_ONLY_FIELDS, BookingReadSerializer
from .write_serializers import BookingCancelSerializer, BookingCreateSerializer


class BookingSerializer(BookingReadSerializer, BookingCreateSerializer):
    class Meta(BookingReadSerializer.Meta):
        fields = BookingReadSerializer.Meta.fields
        read_only_fields = BOOKING_READ_ONLY_FIELDS

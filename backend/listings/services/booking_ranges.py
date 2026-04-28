from bookings.expiry import active_booking_filter


def get_blocked_ranges(boat):
    bookings = getattr(boat, 'prefetched_active_bookings', None)

    if bookings is None:
        bookings = boat.bookings.filter(
            active_booking_filter(),
        ).order_by('start_date')

    return [
        {
            'start_date': booking.start_date,
            'end_date': booking.end_date,
        }
        for booking in bookings
    ]
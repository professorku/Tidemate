def get_blocked_ranges(boat):
    bookings = getattr(boat, 'prefetched_active_bookings', None)

    if bookings is None:
        bookings = boat.bookings.filter(
            status__in=['pending', 'confirmed']
        ).order_by('start_date')

    return [
        {
            'start_date': booking.start_date,
            'end_date': booking.end_date,
            'status': booking.status,
        }
        for booking in bookings
    ]

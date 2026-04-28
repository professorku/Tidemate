from datetime import time

BOOKING_START_TIME = time(hour=15, minute=0)
BOOKING_END_TIME = time(hour=12, minute=0)

MAX_BOOKING_DURATION_DAYS = 30
PENDING_BOOKING_EXPIRY_MINUTES = 60

FREE_CANCELLATION_WINDOW_HOURS = 48
PARTIAL_REFUND_DAYS_BEFORE = 7


def build_booking_policy():
    pickup_time = BOOKING_START_TIME.strftime('%H:%M')
    return_time = BOOKING_END_TIME.strftime('%H:%M')

    return {
        'title': 'Rental rules',
        'pickup_time': pickup_time,
        'return_time': return_time,
        'max_duration_days': MAX_BOOKING_DURATION_DAYS,
        'pending_booking_expiry_minutes': PENDING_BOOKING_EXPIRY_MINUTES,
        'short_text': (
            f'Pickup from {pickup_time} on the first day. '
            f'Return by {return_time} on the last day. '
            f'Maximum booking length is {MAX_BOOKING_DURATION_DAYS} days. '
            f'Pending requests expire after {PENDING_BOOKING_EXPIRY_MINUTES} minutes if they are not confirmed.'
        ),
        'items': [
            f'Pickup is from {pickup_time} on your start date.',
            f'Return is by {return_time} on your end date.',
            f'Maximum booking length is {MAX_BOOKING_DURATION_DAYS} days.',
            f'Pending booking requests expire after {PENDING_BOOKING_EXPIRY_MINUTES} minutes if they are not confirmed.',
            'The boat stays unavailable to others for the full booked date range while a request is active.',
            'Late returns may incur extra fees if you add that rule later.',
        ],
    }


def build_cancellation_policy():
    return {
        'title': 'Cancellation terms',
        'short_text': (
            'Free cancellation within 48 hours of booking if the trip is still at least '
            '7 days away. After that, refunds depend on how close the trip is.'
        ),
        'items': [
            (
                f'Free cancellation within {FREE_CANCELLATION_WINDOW_HOURS} hours of booking '
                'if pickup is still 7 or more days away.'
            ),
            f'50% refund when cancelled {PARTIAL_REFUND_DAYS_BEFORE}+ days before pickup.',
            f'No refund when cancelled less than {PARTIAL_REFUND_DAYS_BEFORE} days before pickup.',
            'Service fees can be handled separately later if needed.',
        ],
    }
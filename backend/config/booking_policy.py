from datetime import time

BOOKING_START_TIME = time(hour=15, minute=0)
BOOKING_END_TIME = time(hour=12, minute=0)

MAX_BOOKING_DURATION_DAYS = 30
PENDING_BOOKING_EXPIRY_MINUTES = 60

FREE_CANCELLATION_WINDOW_HOURS = 48
PARTIAL_REFUND_DAYS_BEFORE = 7


def _format_time(value):
    return value.strftime('%H:%M')


def build_booking_policy():
    pickup_time = _format_time(BOOKING_START_TIME)
    return_time = _format_time(BOOKING_END_TIME)

    short_text = (
        f'Pickup from {pickup_time} on the first day. '
        f'Return by {return_time} on the last day. '
        f'Maximum booking length is {MAX_BOOKING_DURATION_DAYS} days. '
        f'Pending requests expire after {PENDING_BOOKING_EXPIRY_MINUTES} minutes if they are not confirmed.'
    )

    return {
        'title': 'Rental rules',
        'pickup_time': pickup_time,
        'return_time': return_time,
        'max_duration_days': MAX_BOOKING_DURATION_DAYS,
        'pending_booking_expiry_minutes': PENDING_BOOKING_EXPIRY_MINUTES,
        'short_text': short_text,
        'display_text': short_text,
        'items': [
            f'Pickup is from {pickup_time} on your start date.',
            f'Return is by {return_time} on your end date.',
            f'Maximum booking length is {MAX_BOOKING_DURATION_DAYS} days.',
            f'Pending booking requests expire after {PENDING_BOOKING_EXPIRY_MINUTES} minutes if they are not confirmed.',
            'The boat stays unavailable to others for the full booked date range while a request is active.',
            'Late returns may incur extra fees if the host adds that rule later.',
        ],
    }


def build_cancellation_policy():
    short_text = (
        f'Free cancellation within {FREE_CANCELLATION_WINDOW_HOURS} hours of booking '
        f'if the trip is still at least {PARTIAL_REFUND_DAYS_BEFORE} days away. '
        'After that, refunds depend on how close the trip is.'
    )

    return {
        'title': 'Cancellation terms',
        'free_cancellation_window_hours': FREE_CANCELLATION_WINDOW_HOURS,
        'partial_refund_days_before': PARTIAL_REFUND_DAYS_BEFORE,
        'short_text': short_text,
        'display_text': short_text,
        'items': [
            (
                f'Free cancellation within {FREE_CANCELLATION_WINDOW_HOURS} hours of booking '
                f'if pickup is still {PARTIAL_REFUND_DAYS_BEFORE} or more days away.'
            ),
            f'50% refund when cancelled {PARTIAL_REFUND_DAYS_BEFORE}+ days before pickup.',
            f'No refund when cancelled less than {PARTIAL_REFUND_DAYS_BEFORE} days before pickup.',
            'Service fees can be handled separately later if needed.',
        ],
    }
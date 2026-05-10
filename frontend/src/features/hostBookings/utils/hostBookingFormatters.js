import {
  formatBoatType,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingStatusLabel,
  formatBookingWindow as buildBookingWindow,
} from '../../../utils/format/booking'
import { formatCurrency } from '../../../utils/format/number'

export function formatDate(value) {
  return formatBookingDate(value, {
    locale: 'en-GB',
    fallback: '—',
    dateOptions: { day: '2-digit', month: 'short', year: 'numeric' },
  })
}

export function formatDateTime(value) {
  return formatBookingDateTime(value, {
    locale: 'en-GB',
    fallback: '—',
    dateOptions: {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  })
}

export function formatBookingWindow(booking) {
  return buildBookingWindow(booking, {
    formatDate,
    formatDateTime,
    fallback: '—',
  })
}

export function formatMoney(value) {
  return formatCurrency(value, {
    locale: 'en-NO',
    currency: 'NOK',
    maximumFractionDigits: 0,
  })
}

export { formatBoatType }

export function getHostTimelineStatus(booking) {
  if (booking?.lifecycle_stage) {
    return booking.lifecycle_stage
  }

  if (booking?.status === 'cancelled') return 'cancelled'
  if (booking?.status === 'pending') return 'pending'
  if (booking?.status === 'awaiting_payment') return 'awaiting_payment'

  const now = new Date()

  const start = booking?.pickup_datetime
    ? new Date(booking.pickup_datetime)
    : new Date(booking?.start_date)

  const end = booking?.return_datetime
    ? new Date(booking.return_datetime)
    : new Date(booking?.end_date)

  if (end < now) return 'completed'
  if (start <= now && end >= now) return 'active'
  return 'upcoming'
}

export function formatStatusLabel(status) {
  return formatBookingStatusLabel(status)
}

export function hostStatusClasses(status) {
  switch (status) {
    case 'confirmed':
      return 'bg-gold text-navy ring-1 ring-gold/40'
    case 'pending':
    case 'awaiting_payment':
      return 'bg-gold/15 text-gold ring-1 ring-gold/40'
    case 'cancelled':
      return 'bg-red-500/15 text-red-100 ring-1 ring-red-400/40'
    default:
      return 'bg-white/10 text-white ring-1 ring-white/15'
  }
}

export function hostTimelineBadgeClasses(tab) {
  switch (tab) {
    case 'active':
      return 'bg-gold text-navy ring-1 ring-gold/40'
    case 'upcoming':
      return 'bg-white text-navy ring-1 ring-white/30'
    case 'completed':
      return 'bg-gold/15 text-gold ring-1 ring-gold/40'
    case 'pending':
    case 'awaiting_payment':
      return 'bg-gold/15 text-gold ring-1 ring-gold/40'
    case 'cancelled':
      return 'bg-red-500/15 text-red-100 ring-1 ring-red-400/40'
    default:
      return 'bg-white/10 text-white ring-1 ring-white/15'
  }
}

export function getHostTimelineLabel(tab) {
  switch (tab) {
    case 'active':
      return 'On trip'
    case 'upcoming':
      return 'Upcoming'
    case 'completed':
      return 'Completed'
    case 'pending':
      return 'Awaiting host approval'
    case 'awaiting_payment':
      return 'Awaiting payment'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Booking'
  }
}

export function getHostDateHint(booking, timelineStatus) {
  if (timelineStatus === 'cancelled') {
    return booking.cancelled_at
      ? `Cancelled on ${formatDate(booking.cancelled_at)}`
      : 'This booking was cancelled.'
  }

  if (timelineStatus === 'pending') {
    return 'Waiting for your response.'
  }

  if (timelineStatus === 'awaiting_payment') {
    return 'Waiting for renter payment.'
  }

  if (timelineStatus === 'active') {
    return 'This trip is currently active.'
  }

  if (timelineStatus === 'completed') {
    const bookingWindow = formatBookingWindow(booking)
    return `Returned ${bookingWindow.return}`
  }

  const bookingWindow = formatBookingWindow(booking)
  return `Pickup ${bookingWindow.pickup}`
}

export const hostBookingTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'awaiting_payment', label: 'Awaiting payment' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
]
import {
  formatBookingDate,
  formatBookingDateTime,
  formatBookingWindow as buildBookingWindow,
} from '../../../utils/format/booking'
import { formatCurrency, formatRatingStars } from '../../../utils/format/number'

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
    dateOptions: { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
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
  return formatCurrency(value, { locale: 'en-NO', currency: 'NOK' })
}

export function getTimelineStatus(booking) {
  if (booking?.lifecycle_stage) {
    return booking.lifecycle_stage
  }

  if (booking?.status === 'cancelled') return 'cancelled'
  if (booking?.status === 'pending') return 'pending'

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

export function statusClasses(status) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-700 ring-1 ring-green-200'
    case 'pending':
      return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 ring-1 ring-red-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  }
}

export function timelineBadgeClasses(tab) {
  switch (tab) {
    case 'active':
      return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200'
    case 'upcoming':
      return 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
    case 'pending':
      return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 ring-1 ring-red-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  }
}

export function getTimelineLabel(tab) {
  switch (tab) {
    case 'active':
      return 'On trip'
    case 'upcoming':
      return 'Upcoming'
    case 'completed':
      return 'Completed'
    case 'pending':
      return 'Awaiting approval'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Booking'
  }
}

export function getDateHint(booking, timelineStatus) {
  if (timelineStatus === 'cancelled') {
    return booking.cancelled_at
      ? `Cancelled on ${formatDate(booking.cancelled_at)}`
      : 'This booking was cancelled.'
  }

  if (timelineStatus === 'pending') {
    return 'Waiting for host confirmation.'
  }

  if (timelineStatus === 'active') {
    return 'Your trip is currently active.'
  }

  if (timelineStatus === 'completed') {
    const bookingWindow = formatBookingWindow(booking)
    return `Returned ${bookingWindow.return}`
  }

  const bookingWindow = formatBookingWindow(booking)
  return `Pickup ${bookingWindow.pickup}`
}

export function formatRatingLabel(value) {
  return formatRatingStars(value)
}

export const bookingTabs = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'On trip' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

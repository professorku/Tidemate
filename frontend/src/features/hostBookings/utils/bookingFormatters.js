import {
  formatBoatType,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingWindow as buildBookingWindow,
  getStatusBadgeClass,
} from '../../../utils/format/booking'
import { formatCurrency } from '../../../utils/format/number'

export function formatDate(value) {
  return formatBookingDate(value, {
    locale: 'en-GB',
    fallback: '—',
    dateOptions: {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
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

export function statusBadgeClass(status) {
  return getStatusBadgeClass(status, {
    confirmed: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    cancelled: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    defaultClass: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  })
}

export function formatStatusLabel(status) {
  if (!status) return 'Booking'

  const labels = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
  }

  return labels[status] || status
}

export { formatBoatType }

export function isPastTrip(booking) {
  if (!booking?.end_date && !booking?.return_datetime) return false

  const end = booking?.return_datetime
    ? new Date(booking.return_datetime)
    : new Date(booking.end_date)

  const now = new Date()

  return end.getTime() < now.getTime()
}

export function getHostTimelineStatus(booking) {
  if (booking?.status === 'cancelled') return 'cancelled'
  if (booking?.status === 'pending') return 'pending'

  if (booking?.lifecycle_stage) {
    return booking.lifecycle_stage
  }

  if (booking?.status === 'confirmed') {
    if (isPastTrip(booking)) return 'completed'
    return 'confirmed'
  }

  return 'booking'
}

export function getHostTimelineLabel(status) {
  const labels = {
    pending: 'Needs response',
    confirmed: 'Confirmed',
    upcoming: 'Upcoming',
    active: 'On trip',
    completed: 'Completed',
    cancelled: 'Cancelled',
    booking: 'Booking',
  }

  return labels[status] || labels.booking
}

export function timelineBadgeClasses(status) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
    case 'confirmed':
    case 'upcoming':
      return 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
    case 'active':
      return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200'
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 ring-1 ring-red-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  }
}

export const hostBookingTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export function getEmptyStateForTab(tab) {
  const states = {
    all: {
      title: 'No host bookings yet',
      text: 'When renters request your boats, those bookings will appear here.',
    },
    pending: {
      title: 'No pending requests',
      text: 'New renter requests waiting for approval will appear here.',
    },
    confirmed: {
      title: 'No confirmed bookings',
      text: 'Accepted bookings for your boats will appear here.',
    },
    cancelled: {
      title: 'No cancelled bookings',
      text: 'Cancelled host bookings will appear here for reference.',
    },
  }

  return states[tab] || states.all
}
import {
  formatBoatType,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingWindow as buildBookingWindow,
  getStatusBadgeClass,
} from '../../../utils/format/booking'
import { formatCurrency, formatRatingStars } from '../../../utils/format/number'

export function formatDate(value) {
  return formatBookingDate(value, {
    locale: 'en-GB',
    fallback: '—',
    dateOptions: {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  })
}

export function formatDateTime(value) {
  return formatBookingDateTime(value, {
    locale: 'en-GB',
    fallback: 'Not available',
    dateOptions: {
      day: 'numeric',
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
    fallback: 'Not available',
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

export function formatStatusLabel(status) {
  if (!status) return 'Booking'

  const labels = {
    confirmed: 'Confirmed',
    pending: 'Awaiting approval',
    cancelled: 'Cancelled',
  }

  return labels[status] || status
}

export function statusBadgeClass(status) {
  return getStatusBadgeClass(status, {
    confirmed: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    cancelled: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    defaultClass: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  })
}

export function getLifecycleLabel(booking) {
  const stage = booking?.lifecycle_stage

  const labels = {
    pending: 'Awaiting host approval',
    upcoming: 'Upcoming trip',
    active: 'Trip in progress',
    completed: 'Trip completed',
    cancelled: 'Booking cancelled',
  }

  if (stage && labels[stage]) return labels[stage]
  if (booking?.status === 'pending') return labels.pending
  if (booking?.status === 'cancelled') return labels.cancelled
  if (booking?.trip_finished) return labels.completed
  return labels.upcoming
}

export function getBookingHint(booking, viewerRole = 'renter') {
  if (!booking) return ''

  if (booking.status === 'cancelled') {
    return 'This booking is no longer active.'
  }

  if (booking.status === 'pending') {
    return viewerRole === 'host'
      ? 'Review the request and confirm it if the dates work for you.'
      : 'The host has received your request and can confirm or decline it.'
  }

  if (booking.lifecycle_stage === 'active') {
    return 'This trip is currently active. Keep pickup and return details handy.'
  }

  if (booking.trip_finished || booking.lifecycle_stage === 'completed') {
    return 'The trip is finished. You can leave a review if reviews are still available.'
  }

  return 'Your booking is confirmed. Check the pickup details before the trip starts.'
}

export function getBackLinkForViewer(viewerRole = 'renter') {
  return viewerRole === 'host'
    ? { to: '/host-bookings', label: 'Back to host bookings' }
    : { to: '/my-bookings', label: 'Back to my bookings' }
}

export function formatRatingLabel(value) {
  return formatRatingStars(value)
}
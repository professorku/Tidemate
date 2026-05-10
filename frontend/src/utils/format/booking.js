import { formatDate as baseFormatDate, formatDateTime as baseFormatDateTime } from './date'
import { formatBoatType } from './boat'

export function formatBookingDate(value, options = {}) {
  return baseFormatDate(value, options)
}

export function formatBookingDateTime(value, options = {}) {
  return baseFormatDateTime(value, options)
}

function getPolicyTime(policy, key, fallback) {
  if (!policy || typeof policy !== 'object') {
    return fallback
  }

  return policy[key] || fallback
}

export function formatBookingStatusLabel(status, fallback = 'Booking') {
  if (!status) return fallback

  const labels = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    awaiting_payment: 'Awaiting payment',
    cancelled: 'Cancelled',
    active: 'Active',
    upcoming: 'Upcoming',
    completed: 'Completed',
  }

  if (labels[status]) return labels[status]

  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatBookingWindow(booking, {
  formatDate = formatBookingDate,
  formatDateTime = formatBookingDateTime,
  fallback = 'Not available',
  fallbackTime = '15:00',
  returnTime = '12:00',
} = {}) {
  if (!booking) {
    return {
      pickup: fallback,
      return: fallback,
    }
  }

  const pickupTime = getPolicyTime(
    booking?.rental_policy,
    'pickup_time',
    fallbackTime
  )

  const resolvedReturnTime = getPolicyTime(
    booking?.rental_policy,
    'return_time',
    returnTime
  )

  if (booking.start_date || booking.end_date) {
    return {
      pickup: booking.start_date
        ? `${formatDate(booking.start_date)} at ${pickupTime}`
        : fallback,
      return: booking.end_date
        ? `${formatDate(booking.end_date)} at ${resolvedReturnTime}`
        : fallback,
    }
  }

  if (booking.pickup_datetime || booking.return_datetime) {
    return {
      pickup: booking.pickup_datetime
        ? formatDateTime(booking.pickup_datetime)
        : fallback,
      return: booking.return_datetime
        ? formatDateTime(booking.return_datetime)
        : fallback,
    }
  }

  return {
    pickup: fallback,
    return: fallback,
  }
}

export function getStatusBadgeClass(status, {
  confirmed = 'bg-green-100 text-green-700',
  pending = 'bg-amber-100 text-amber-800',
  awaiting_payment = 'bg-amber-100 text-amber-800',
  cancelled = 'bg-red-100 text-red-700',
  defaultClass = 'bg-slate-100 text-slate-700',
} = {}) {
  if (status === 'confirmed') return confirmed
  if (status === 'pending') return pending
  if (status === 'awaiting_payment') return awaiting_payment
  if (status === 'cancelled') return cancelled
  return defaultClass
}

export { formatBoatType }
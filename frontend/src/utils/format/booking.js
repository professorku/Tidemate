import { formatDate as baseFormatDate, formatDateTime as baseFormatDateTime } from './date'
import { formatBoatType } from './boat'

export function formatBookingDate(value, options = {}) {
  return baseFormatDate(value, options)
}

export function formatBookingDateTime(value, options = {}) {
  return baseFormatDateTime(value, options)
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

  if (booking.pickup_datetime || booking.return_datetime) {
    return {
      pickup: booking.pickup_datetime ? formatDateTime(booking.pickup_datetime) : fallback,
      return: booking.return_datetime ? formatDateTime(booking.return_datetime) : fallback,
    }
  }

  const pickupTime = booking?.rental_policy?.pickup_time || fallbackTime
  const resolvedReturnTime = booking?.rental_policy?.return_time || returnTime

  return {
    pickup: `${formatDate(booking.start_date)} at ${pickupTime}`,
    return: `${formatDate(booking.end_date)} at ${resolvedReturnTime}`,
  }
}

export function getStatusBadgeClass(status, {
  confirmed = 'bg-green-100 text-green-700',
  pending = 'bg-amber-100 text-amber-800',
  cancelled = 'bg-red-100 text-red-700',
  defaultClass = 'bg-slate-100 text-slate-700',
} = {}) {
  if (status === 'confirmed') return confirmed
  if (status === 'pending') return pending
  if (status === 'cancelled') return cancelled
  return defaultClass
}

export { formatBoatType }

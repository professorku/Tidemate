import {
  formatBoatType,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingWindow as buildBookingWindow,
  getStatusBadgeClass,
} from '../../../utils/format/booking'

export function formatDate(value) {
  return formatBookingDate(value, {
    locale: 'en-US',
    fallback: '',
    dateOptions: { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' },
  })
}

export function formatDateTime(value) {
  return formatBookingDateTime(value, { locale: 'en-US', fallback: 'Not available' })
}

export function formatBookingWindow(booking) {
  return buildBookingWindow(booking, {
    formatDate,
    formatDateTime,
    fallback: 'Not available',
  })
}

export { formatBoatType }

export function statusBadgeClass(status) {
  return getStatusBadgeClass(status)
}

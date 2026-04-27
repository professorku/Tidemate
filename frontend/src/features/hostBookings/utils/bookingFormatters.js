import {
  formatBoatType,
  formatBookingDate,
  formatBookingDateTime,
  getStatusBadgeClass,
} from '../../../utils/format/booking'

export function formatDate(value) {
  return formatBookingDate(value, { locale: 'en-US', fallback: '' })
}

export function formatDateTime(value) {
  return formatBookingDateTime(value, { locale: 'en-US', fallback: '' })
}

export function statusBadgeClass(status) {
  return getStatusBadgeClass(status)
}

export { formatBoatType }

export function getSectionContent(statusFilter) {
  if (statusFilter === 'pending') {
    return {
      title: 'Pending requests',
      text: 'Review incoming requests and respond quickly to guests.',
    }
  }

  if (statusFilter === 'confirmed') {
    return {
      title: 'Confirmed bookings',
      text: 'Upcoming or accepted trips for your boats.',
    }
  }

  if (statusFilter === 'cancelled') {
    return {
      title: 'Cancelled bookings',
      text: 'Archived bookings that were cancelled by you or the guest.',
    }
  }

  return {
    title: 'All host bookings',
    text: 'Manage all rental activity for your boats in one place.',
  }
}

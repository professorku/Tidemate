export const PREVIEW_PAGE_SIZE = 100

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

export function createEmptyNotificationsPage() {
  return {
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: PREVIEW_PAGE_SIZE,
    totalPages: 1,
    results: [],
  }
}

function getNotificationDate(dateString) {
  if (!dateString) return null

  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatNotificationTime(dateString) {
  const date = getNotificationDate(dateString)

  if (!date) return 'Just now'

  const diffMs = date.getTime() - Date.now()
  const absDiff = Math.abs(diffMs)

  if (absDiff < MINUTE) return 'Just now'

  if (absDiff < HOUR) {
    return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
      Math.round(diffMs / MINUTE),
      'minute'
    )
  }

  if (absDiff < DAY) {
    return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
      Math.round(diffMs / HOUR),
      'hour'
    )
  }

  if (absDiff < WEEK) {
    return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
      Math.round(diffMs / DAY),
      'day'
    )
  }

  const dateOptions = {
    month: 'short',
    day: 'numeric',
  }

  if (date.getFullYear() !== new Date().getFullYear()) {
    dateOptions.year = 'numeric'
  }

  return date.toLocaleDateString([], dateOptions)
}

export function formatNotificationFullTime(dateString) {
  const date = getNotificationDate(dateString)

  if (!date) return 'Just now'

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getNotificationKind(notification) {
  const message = (notification?.message || '').toLowerCase()
  const targetUrl = (notification?.target_url || '').toLowerCase()
  const searchableText = `${message} ${targetUrl}`

  if (
    searchableText.includes('/messages') ||
    searchableText.includes('message') ||
    searchableText.includes('chat') ||
    searchableText.includes('conversation')
  ) {
    return 'message'
  }

  if (
    searchableText.includes('/bookings') ||
    searchableText.includes('/host-bookings') ||
    searchableText.includes('booking') ||
    searchableText.includes('request') ||
    searchableText.includes('confirmed') ||
    searchableText.includes('cancelled') ||
    searchableText.includes('approved')
  ) {
    return 'booking'
  }

  if (searchableText.includes('review') || searchableText.includes('rating')) {
    return 'review'
  }

  if (
    searchableText.includes('/profile') ||
    searchableText.includes('profile') ||
    searchableText.includes('email') ||
    searchableText.includes('password') ||
    searchableText.includes('account')
  ) {
    return 'account'
  }

  return 'update'
}

export function getNotificationKindLabel(notification) {
  const labels = {
    message: 'Message',
    booking: 'Booking',
    review: 'Review',
    account: 'Account',
    update: 'Update',
  }

  return labels[getNotificationKind(notification)] || labels.update
}
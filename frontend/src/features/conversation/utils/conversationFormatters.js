export function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export function formatDateTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function formatTimeOnly(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'

  const number = Number(value)
  if (Number.isNaN(number)) return value

  try {
    return new Intl.NumberFormat('en-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0,
    }).format(number)
  } catch {
    return `${number} kr`
  }
}

export function getBookingStatusClass(status) {
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

export function getTripState(conversation) {
  if (!conversation?.start_date || !conversation?.end_date) return 'general'
  if (conversation.booking_status === 'cancelled') return 'cancelled'
  if (conversation.booking_status === 'pending') return 'pending'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(conversation.start_date)
  const end = new Date(conversation.end_date)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  if (end < today) return 'completed'
  if (start <= today && end >= today) return 'active'
  return 'upcoming'
}

export function getTripStateLabel(conversation) {
  const state = getTripState(conversation)

  switch (state) {
    case 'pending':
      return 'Awaiting approval'
    case 'cancelled':
      return 'Cancelled booking'
    case 'active':
      return 'Trip in progress'
    case 'completed':
      return 'Trip completed'
    case 'upcoming':
      return 'Upcoming trip'
    default:
      return 'Direct conversation'
  }
}

export function getTripStateClass(conversation) {
  const state = getTripState(conversation)

  switch (state) {
    case 'pending':
      return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 ring-1 ring-red-200'
    case 'active':
      return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200'
    case 'completed':
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
    case 'upcoming':
      return 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  }
}

export function dayLabel(value) {
  if (!value) return ''

  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const normalize = (d) => {
    const copy = new Date(d)
    copy.setHours(0, 0, 0, 0)
    return copy.getTime()
  }

  const current = normalize(date)

  if (current === normalize(today)) return 'Today'
  if (current === normalize(yesterday)) return 'Yesterday'

  try {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export function shouldShowDateSeparator(currentMessage, previousMessage) {
  if (!currentMessage) return false
  if (!previousMessage) return true

  const currentDate = new Date(currentMessage.created_at)
  const previousDate = new Date(previousMessage.created_at)

  return currentDate.toDateString() !== previousDate.toDateString()
}

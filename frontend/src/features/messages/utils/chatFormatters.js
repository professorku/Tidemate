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

export function formatRelative(value) {
  if (!value) return '—'

  const date = new Date(value)
  const now = new Date()
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return formatDate(value)
}

export function getConversationTypeLabel(conversation) {
  if (conversation.booking_id) return 'Booking chat'
  return 'Direct inquiry'
}

export function getConversationTypeClass(conversation) {
  if (conversation.booking_id) {
    return 'bg-gold text-navy ring-1 ring-gold/40'
  }

  return 'bg-white/10 text-white ring-1 ring-white/15'
}

export function getBookingStatusClass(status) {
  switch (status) {
    case 'confirmed':
      return 'bg-gold text-navy ring-1 ring-gold/40'
    case 'pending':
      return 'bg-gold/15 text-gold ring-1 ring-gold/40'
    case 'cancelled':
      return 'bg-red-500/15 text-red-100 ring-1 ring-red-400/40'
    default:
      return 'bg-white/10 text-white ring-1 ring-white/15'
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
      return 'Cancelled'
    case 'active':
      return 'Trip active'
    case 'completed':
      return 'Completed'
    case 'upcoming':
      return 'Upcoming'
    default:
      return 'General'
  }
}

export function getTripStateClass(conversation) {
  const state = getTripState(conversation)

  switch (state) {
    case 'pending':
      return 'bg-gold/15 text-gold ring-1 ring-gold/40'
    case 'cancelled':
      return 'bg-red-500/15 text-red-100 ring-1 ring-red-400/40'
    case 'active':
      return 'bg-gold text-navy ring-1 ring-gold/40'
    case 'completed':
      return 'bg-white/10 text-white ring-1 ring-white/15'
    case 'upcoming':
      return 'bg-white text-navy ring-1 ring-white/30'
    default:
      return 'bg-white/10 text-white ring-1 ring-white/15'
  }
}
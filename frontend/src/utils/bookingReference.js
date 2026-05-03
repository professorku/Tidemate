export function getBookingReference(booking) {
  if (booking?.public_id) return booking.public_id
  if (booking?.id) return `#${booking.id}`
  return '—'
}

export function getBookingPath(booking) {
  const lookup = booking?.public_id || booking?.id
  return lookup ? `/bookings/${lookup}` : '/my-bookings'
}

export function getConversationBookingReference(conversation) {
  if (conversation?.booking_public_id) return conversation.booking_public_id
  if (conversation?.booking_id) return `#${conversation.booking_id}`
  return '—'
}

export function getConversationBookingPath(conversation) {
  const lookup = conversation?.booking_public_id || conversation?.booking_id
  return lookup ? `/bookings/${lookup}` : null
}
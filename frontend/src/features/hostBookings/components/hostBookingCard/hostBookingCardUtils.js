export function getBoatId(booking) {
  return booking.boat || booking.boat_id || booking.boat_uuid
}

export function getRenterId(booking) {
  return booking.renter || booking.renter_id || booking.user || booking.user_id
}

export function getCancelReasonValue(cancelReason, bookingId) {
  if (!cancelReason) return ''
  if (typeof cancelReason === 'string') return cancelReason
  return cancelReason?.[bookingId] || ''
}

export function getHostBookingCardState({
  booking,
  timelineStatus,
  actionLoadingId,
  canDeleteBooking,
}) {
  const isCancelled =
    timelineStatus === 'cancelled' || booking.status === 'cancelled'

  const isPending = timelineStatus === 'pending' && !isCancelled

  const displayStatus = isCancelled
    ? 'cancelled'
    : isPending
      ? 'pending'
      : booking.status

  const isActionLoading = actionLoadingId === booking.id
  const canConfirm = Boolean(booking.can_confirm ?? isPending)

  const canCancel = Boolean(
    booking.can_cancel ?? (!isCancelled && timelineStatus !== 'completed')
  )

  const canDelete = canDeleteBooking ? canDeleteBooking(booking) : isCancelled

  return {
    isCancelled,
    isPending,
    displayStatus,
    isActionLoading,
    canConfirm,
    canCancel,
    canDelete,
  }
}
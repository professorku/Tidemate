export default function BookingCardCancellationNotice({ booking }) {
  if (booking.status !== 'cancelled') {
    return null
  }

  return (
    <div className="mt-4 rounded-[18px] border border-red-100 bg-red-50 p-3.5 text-sm">
      <p className="font-semibold text-red-700">Cancelled by {booking.cancelled_by || 'unknown'}</p>

      {booking.cancellation_reason ? (
        <p className="mt-1.5 text-red-700">Reason: {booking.cancellation_reason}</p>
      ) : (
        <p className="mt-1.5 text-red-600">No cancellation reason was provided.</p>
      )}
    </div>
  )
}

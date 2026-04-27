export default function BookingCardActionPanel({
  booking,
  isProcessing,
  cancelReason,
  setCancelReason,
  handleConfirm,
  handleCancel,
}) {
  if (!booking.can_confirm && !booking.can_cancel) {
    return null
  }

  return (
    <aside className="w-full rounded-[20px] border border-slate-200 bg-slate-50 p-4 xl:max-w-[280px]">
      <h3 className="text-base font-bold text-slate-900">Actions</h3>

      {booking.can_confirm ? (
        <button
          type="button"
          onClick={() => handleConfirm(booking.id)}
          disabled={isProcessing}
          className="mt-3 w-full rounded-full bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? 'Processing...' : 'Confirm booking'}
        </button>
      ) : null}

      {booking.can_cancel ? (
        <>
          <label className="mb-1.5 mt-3 block text-sm font-semibold text-slate-700">
            Cancellation reason
          </label>

          <textarea
            rows="4"
            value={cancelReason[booking.id] || ''}
            onChange={(e) =>
              setCancelReason((prev) => ({
                ...prev,
                [booking.id]: e.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy"
            placeholder="Weather issues, maintenance, unavailable dates..."
          />

          <button
            type="button"
            onClick={() => handleCancel(booking.id)}
            disabled={isProcessing}
            className="mt-3 w-full rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? 'Processing...' : 'Cancel booking'}
          </button>
        </>
      ) : null}
    </aside>
  )
}

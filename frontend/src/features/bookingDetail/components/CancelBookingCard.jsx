import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

export default function CancelBookingCard({
  booking,
  cancelReason,
  setCancelReason,
  actionLoading,
  confirming,
  cancelling,
  handleConfirm,
  handleCancel,
}) {
  const canConfirm = Boolean(booking?.can_confirm)
  const canCancel = Boolean(booking?.can_cancel)

  if (!canConfirm && !canCancel) return null

  return (
    <div className="rounded-[30px] border border-gold/20 bg-navy p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
          <CheckCircleIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Booking actions</h2>
          <p className="mt-1 text-sm leading-6 text-white/60">
            {canConfirm
              ? 'Confirm the request if the boat is available for these dates.'
              : 'You can cancel this booking while the cancellation policy allows it.'}
          </p>
        </div>
      </div>

      {canConfirm ? (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={actionLoading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-extrabold text-navy shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {confirming ? 'Confirming...' : 'Confirm booking'}
        </button>
      ) : null}

      {canCancel ? (
        <div className={canConfirm ? 'mt-5 border-t border-gold/15 pt-5' : 'mt-5'}>
          <div className="rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            <div className="flex gap-2">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="leading-6">
                Cancelling changes the booking status for both renter and host.
                Add a short reason so the other person understands what happened.
              </p>
            </div>
          </div>

          <label className="mb-2 mt-4 block text-sm font-semibold text-white/80">
            Cancellation reason
          </label>

          <textarea
            rows="4"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            disabled={actionLoading}
            className="w-full rounded-2xl border border-gold/25 bg-[#071d32]/80 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Change of plans, weather, schedule conflict..."
          />

          <button
            type="button"
            onClick={handleCancel}
            disabled={actionLoading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircleIcon className="h-5 w-5" />
            {cancelling ? 'Cancelling...' : 'Cancel booking'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
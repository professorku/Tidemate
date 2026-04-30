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
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy">
          <CheckCircleIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Booking actions</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
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
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {confirming ? 'Confirming...' : 'Confirm booking'}
        </button>
      ) : null}

      {canCancel ? (
        <div className={canConfirm ? 'mt-5 border-t border-slate-200 pt-5' : 'mt-5'}>
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex gap-2">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="leading-6">
                Cancelling changes the booking status for both renter and host.
                Add a short reason so the other person understands what happened.
              </p>
            </div>
          </div>

          <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">
            Cancellation reason
          </label>

          <textarea
            rows="4"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            disabled={actionLoading}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-navy disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
            placeholder="Change of plans, weather, schedule conflict..."
          />

          <button
            type="button"
            onClick={handleCancel}
            disabled={actionLoading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircleIcon className="h-5 w-5" />
            {cancelling ? 'Cancelling...' : 'Cancel booking'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
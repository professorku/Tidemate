import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

export default function BookingCardActionPanel({
  booking,
  isProcessing,
  cancelReason,
  setCancelReason,
  handleConfirm,
  handleCancel,
}) {
  if (!booking.can_confirm && !booking.can_cancel) {
    return (
      <aside className="border-t border-slate-200 bg-slate-50 p-5 xl:border-l xl:border-t-0">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-900">No actions needed</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            This booking does not currently require a host action.
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="border-t border-slate-200 bg-slate-50 p-5 xl:border-l xl:border-t-0">
      <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy">
            <CheckCircleIcon className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Host actions
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Confirm the request or cancel with a short reason for the renter.
            </p>
          </div>
        </div>

        {booking.can_confirm ? (
          <button
            type="button"
            onClick={() => handleConfirm(booking)}
            disabled={isProcessing}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircleIcon className="h-5 w-5" />
            {isProcessing ? 'Processing...' : 'Confirm booking'}
          </button>
        ) : null}

        {booking.can_cancel ? (
          <div className={booking.can_confirm ? 'mt-5 border-t border-slate-200 pt-5' : 'mt-5'}>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="flex gap-2">
                <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="leading-6">
                  Add context if the boat is unavailable, under maintenance, or the
                  dates no longer work.
                </p>
              </div>
            </div>

            <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">
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
              disabled={isProcessing}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-navy disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
              placeholder="Weather issues, maintenance, unavailable dates..."
            />

            <button
              type="button"
              onClick={() => handleCancel(booking)}
              disabled={isProcessing}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <XCircleIcon className="h-5 w-5" />
              {isProcessing ? 'Processing...' : 'Cancel booking'}
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
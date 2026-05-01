import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { formatDateTime } from '../../utils/bookingFormatters'

export default function BookingCardCancellationNotice({ booking }) {
  if (booking.status !== 'cancelled') {
    return null
  }

  return (
    <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 ring-1 ring-red-100">
          <ExclamationTriangleIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-extrabold text-red-900">
            Cancelled by {booking.cancelled_by || 'unknown'}
          </p>

          {booking.cancelled_at ? (
            <p className="mt-0.5 text-xs font-medium text-red-700">
              {formatDateTime(booking.cancelled_at)}
            </p>
          ) : null}

          <p className="mt-1.5 text-sm leading-6 text-red-800">
            {booking.cancellation_reason ||
              'No cancellation reason was provided.'}
          </p>
        </div>
      </div>
    </div>
  )
}
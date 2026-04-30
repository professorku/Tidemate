import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import InfoCard from './InfoCard'
import { formatDateTime, formatStatusLabel } from '../utils/bookingFormatters'

export default function CancellationDetails({ booking }) {
  return (
    <div className="rounded-[30px] border border-red-200 bg-red-50 p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 ring-1 ring-red-100">
          <ExclamationTriangleIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
            {formatStatusLabel(booking.status)}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-red-900">
            Cancellation details
          </h2>
          <p className="mt-1 text-sm leading-6 text-red-700">
            This explains who cancelled the booking and why.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoCard
          label="Cancelled by"
          value={booking.cancelled_by || 'Unknown'}
          muted
          className="bg-white/75"
        />

        <InfoCard
          label="Cancelled at"
          value={
            booking.cancelled_at
              ? formatDateTime(booking.cancelled_at)
              : 'Not available'
          }
          muted
          className="bg-white/75"
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white/75 p-4 ring-1 ring-red-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
          Reason
        </p>

        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-red-800">
          {booking.cancellation_reason ||
            'No cancellation reason was provided.'}
        </p>
      </div>
    </div>
  )
}
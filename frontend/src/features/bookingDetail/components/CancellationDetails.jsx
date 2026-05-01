import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import InfoCard from './InfoCard'
import { formatDateTime, formatStatusLabel } from '../utils/bookingFormatters'

export default function CancellationDetails({ booking }) {
  return (
    <div className="rounded-[30px] border border-red-300/25 bg-red-400/10 p-5 shadow-soft md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-400/10 text-red-200 ring-1 ring-red-300/25">
          <ExclamationTriangleIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-200">
            {formatStatusLabel(booking.status)}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-white">
            Cancellation details
          </h2>
          <p className="mt-1 text-sm leading-6 text-red-100/80">
            This explains who cancelled the booking and why.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoCard
          label="Cancelled by"
          value={booking.cancelled_by || 'Unknown'}
          muted
        />

        <InfoCard
          label="Cancelled at"
          value={
            booking.cancelled_at
              ? formatDateTime(booking.cancelled_at)
              : 'Not available'
          }
          muted
        />
      </div>

      <div className="mt-4 rounded-2xl border border-red-300/25 bg-[#071d32]/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-200">
          Reason
        </p>

        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-red-100/85">
          {booking.cancellation_reason ||
            'No cancellation reason was provided.'}
        </p>
      </div>
    </div>
  )
}
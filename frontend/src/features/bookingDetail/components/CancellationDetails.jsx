import InfoCard from './InfoCard'
import { formatDateTime } from '../utils/bookingFormatters'

export default function CancellationDetails({ booking }) {
  return (
    <div className="rounded-[30px] border border-red-100 bg-red-50 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-red-700">Cancellation details</h2>

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

      <div className="mt-4 rounded-2xl bg-white/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
          Reason
        </p>

        <p className="mt-2 text-red-700">
          {booking.cancellation_reason ||
            'No cancellation reason was provided.'}
        </p>
      </div>
    </div>
  )
}
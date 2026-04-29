import PolicyCard from '../../../components/PolicyCard'
import InfoCard from './InfoCard'
import { formatDateTime } from '../utils/bookingFormatters'
import { getBoatLocationLabel } from '../../../utils/locationPrivacy'

const fallbackRentalPolicy = {
  title: 'Rental rules',
  short_text: 'Pickup from 15:00 on the first day. Return by 12:00 on the last day.',
  items: [
    'Pickup is from 15:00 on your start date.',
    'Return is by 12:00 on your end date.',
    'Booked dates remain unavailable to other renters.',
  ],
}

const fallbackCancellationPolicy = {
  title: 'Cancellation terms',
  short_text:
    'Free cancellation within 48 hours if the trip is still at least 7 days away.',
  items: [
    'Free cancellation within 48 hours of booking if pickup is still 7+ days away.',
    '50% refund when cancelled 7 or more days before pickup.',
    'No refund when cancelled less than 7 days before pickup.',
  ],
}

export default function BookingSummaryCard({ booking }) {
  const rentalPolicy = booking?.rental_policy || fallbackRentalPolicy
  const cancellationPolicy =
    booking?.cancellation_policy || fallbackCancellationPolicy

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Booking summary</h2>

      <div className="mt-4 space-y-3">
        <InfoCard label="Status" value={booking.status} />
        <InfoCard
          label="Requested"
          value={booking.created_at ? formatDateTime(booking.created_at) : 'Not available'}
          muted
        />
        <InfoCard
          label="Location"
          value={getBoatLocationLabel(booking, 'Location unavailable')}
          muted
        />
      </div>

      <div className="mt-4 grid gap-3">
        <PolicyCard
          title={rentalPolicy.title}
          subtitle={rentalPolicy.short_text}
          items={rentalPolicy.items}
          tone="info"
        />

        <PolicyCard
          title={cancellationPolicy.title}
          subtitle={cancellationPolicy.short_text}
          items={cancellationPolicy.items}
          tone="warning"
        />
      </div>
    </div>
  )
}
import PolicyCard from '../../../components/PolicyCard'

const fallbackRentalPolicy = {
  title: 'Rental rules',
  short_text: 'Pickup from 15:00 on the first day. Return by 12:00 on the last day.',
  items: [
    'Pickup is from 15:00 on your start date.',
    'Return is by 12:00 on your end date.',
    'Booked dates become unavailable for other renters.',
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

export default function BookingInfoCard({ boat }) {
  const rentalPolicy = boat?.rental_policy || fallbackRentalPolicy
  const cancellationPolicy =
    boat?.cancellation_policy || fallbackCancellationPolicy

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] bg-white p-4 shadow-soft md:p-5">
        <h3 className="text-base font-bold text-slate-900">How booking works</h3>

        <div className="mt-3 space-y-2.5 text-sm text-slate-600">
          <p>1. Choose your dates in the calendar.</p>
          <p>2. Review the rental rules and cancellation terms before sending the request.</p>
          <p>3. Send a booking request to the host.</p>
          <p>4. Once confirmed, those dates become unavailable for others.</p>
        </div>
      </div>

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
  )
}
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  ReceiptPercentIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import PolicyCard from '../../../components/PolicyCard'
import InfoCard from './InfoCard'
import {
  formatDateTime,
  formatMoney,
  formatStatusLabel,
} from '../utils/bookingFormatters'
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
    <div className="overflow-hidden rounded-[30px] border border-gold/20 bg-navy shadow-soft lg:sticky lg:top-24">
      <div className="border-b border-gold/10 bg-[#113853] px-5 py-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Price summary
        </p>
        <p className="mt-3 text-4xl font-extrabold tracking-tight">
          {formatMoney(booking.total_price)}
        </p>
        <p className="mt-1 text-sm text-white/65">
          {formatMoney(booking.price_per_day)} per day · {booking.duration_days} day
          {booking.duration_days !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="p-5">
        <div className="space-y-3">
          <InfoCard
            label="Status"
            value={formatStatusLabel(booking.status)}
            icon={<ClockIcon className="h-4 w-4" />}
          />
          <InfoCard
            label="Requested"
            value={booking.created_at ? formatDateTime(booking.created_at) : 'Not available'}
            muted
            icon={<CalendarDaysIcon className="h-4 w-4" />}
          />
          <InfoCard
            label="Location"
            value={getBoatLocationLabel(booking, 'Location unavailable')}
            muted
            icon={<MapPinIcon className="h-4 w-4" />}
          />
          <InfoCard
            label="Booking value"
            value={`${formatMoney(booking.price_per_day)} × ${booking.duration_days} day${
              booking.duration_days !== 1 ? 's' : ''
            }`}
            muted
            icon={<WalletIcon className="h-4 w-4" />}
          />
        </div>

        <div className="mt-5 rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-navy text-gold ring-1 ring-gold/20">
              <ReceiptPercentIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Policies</p>
              <p className="mt-1 text-sm leading-6 text-white/60">
                Rental and cancellation rules are shown below for quick reference.
              </p>
            </div>
          </div>
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
    </div>
  )
}
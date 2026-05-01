import {
  CalendarDaysIcon,
  ClockIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import {
  formatBookingWindow,
  formatDateTime,
  formatMoney,
} from '../../utils/bookingFormatters'

function DetailTile({ icon, label, value, subtext }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-navy ring-1 ring-slate-200">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-bold text-slate-900">
            {value || '—'}
          </p>
          {subtext ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{subtext}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function BookingCardDetailsGrid({ booking }) {
  const bookingWindow = formatBookingWindow(booking)
  const durationLabel = `${booking.duration_days} day${
    booking.duration_days !== 1 ? 's' : ''
  }`

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <DetailTile
        icon={<CalendarDaysIcon className="h-4 w-4" />}
        label="Pickup"
        value={bookingWindow.pickup}
      />

      <DetailTile
        icon={<CalendarDaysIcon className="h-4 w-4" />}
        label="Return"
        value={bookingWindow.return}
      />

      <DetailTile
        icon={<WalletIcon className="h-4 w-4" />}
        label="Earnings"
        value={formatMoney(booking.total_price)}
        subtext={`${formatMoney(booking.price_per_day)} / day · ${durationLabel}`}
      />

      <DetailTile
        icon={<ClockIcon className="h-4 w-4" />}
        label="Requested"
        value={formatDateTime(booking.created_at)}
      />
    </div>
  )
}
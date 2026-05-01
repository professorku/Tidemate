import {
  CalendarDaysIcon,
  ClockIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from '../../utils/bookingFormatters'

function formatTime(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DetailTile({ icon, label, value, subtext }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-navy ring-1 ring-slate-200">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-0.5 break-words text-sm font-extrabold leading-5 text-slate-900">
            {value || '—'}
          </p>
          {subtext ? (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">{subtext}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function BookingCardDetailsGrid({ booking }) {
  const pickupValue = booking.pickup_datetime || booking.start_date
  const returnValue = booking.return_datetime || booking.end_date

  const durationLabel = `${booking.duration_days} day${
    booking.duration_days !== 1 ? 's' : ''
  }`

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <DetailTile
        icon={<CalendarDaysIcon className="h-4 w-4" />}
        label="Pickup"
        value={formatDate(pickupValue)}
        subtext={formatTime(pickupValue)}
      />

      <DetailTile
        icon={<CalendarDaysIcon className="h-4 w-4" />}
        label="Return"
        value={formatDate(returnValue)}
        subtext={formatTime(returnValue)}
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
        value={formatDate(booking.created_at)}
        subtext={formatTime(booking.created_at)}
      />
    </div>
  )
}
import {
  CalendarDaysIcon,
  ClockIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import { getDateHint, formatMoney } from '../utils/bookingFormatters'

function Tile({ icon, label, value, subtext }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
          {icon}
        </div>

        <p className="text-[11px] font-extrabold uppercase tracking-wide text-gold">
          {label}
        </p>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-white">{value}</p>

      {subtext ? (
        <p className="mt-1 text-[11px] font-medium text-white/55">{subtext}</p>
      ) : null}
    </div>
  )
}

export default function BookingCardDetails({ booking, bookingWindow, timelineStatus }) {
  const durationLabel = booking.duration_days
    ? `${booking.duration_days} day${booking.duration_days > 1 ? 's' : ''}`
    : '—'

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Tile
        icon={<CalendarDaysIcon className="h-4 w-4" />}
        label="Pickup"
        value={bookingWindow.pickup}
      />

      <Tile
        icon={<CalendarDaysIcon className="h-4 w-4" />}
        label="Return"
        value={bookingWindow.return}
      />

      <Tile
        icon={<ClockIcon className="h-4 w-4" />}
        label="Trip status"
        value={getDateHint(booking, timelineStatus)}
      />

      <Tile
        icon={<WalletIcon className="h-4 w-4" />}
        label="Total price"
        value={formatMoney(booking.total_price)}
        subtext={durationLabel}
      />
    </div>
  )
} 
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import BookingDetailTile from '../../../components/bookings/BookingDetailTile'
import { getDateHint, formatMoney } from '../utils/bookingFormatters'

function Tile({ icon, label, value, subtext }) {
  return (
    <BookingDetailTile
      label={label}
      value={value}
      subtext={subtext}
      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
      icon={icon}
    />
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
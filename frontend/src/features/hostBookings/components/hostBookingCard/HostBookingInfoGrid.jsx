import {
  CalendarDaysIcon,
  ClockIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import {
  formatBookingWindow,
  formatMoney,
  getHostDateHint,
} from '../../utils/hostBookingFormatters'
import InfoTile from './InfoTile'

export default function HostBookingInfoGrid({ booking, timelineStatus }) {
  const bookingWindow = formatBookingWindow(booking)

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <InfoTile
        icon={<CalendarDaysIcon className="h-4 w-4" />}
        label="Pickup"
        value={bookingWindow.pickup}
      />

      <InfoTile
        icon={<CalendarDaysIcon className="h-4 w-4" />}
        label="Return"
        value={bookingWindow.return}
      />

      <InfoTile
        icon={<ClockIcon className="h-4 w-4" />}
        label="Trip status"
        value={getHostDateHint(booking, timelineStatus)}
      />

      <InfoTile
        icon={<WalletIcon className="h-4 w-4" />}
        label="Total price"
        value={formatMoney(booking.total_price)}
        subtext={
          booking.duration_days
            ? `${booking.duration_days} day${booking.duration_days === 1 ? '' : 's'}`
            : undefined
        }
      />
    </div>
  )
}
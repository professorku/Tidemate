import BookingDetailTile from '../../../components/bookings/BookingDetailTile'
import { getDateHint, formatMoney } from '../utils/bookingFormatters'

export default function BookingCardDetails({ booking, bookingWindow, timelineStatus }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <BookingDetailTile label="Pickup" value={bookingWindow.pickup} />
        <BookingDetailTile label="Return" value={bookingWindow.return} />
        <BookingDetailTile
          label="Duration"
          value={booking.duration_days ? `${booking.duration_days} day${booking.duration_days > 1 ? 's' : ''}` : '—'}
        />
        <BookingDetailTile label="Trip status" value={getDateHint(booking, timelineStatus)} />
      </div>

      <BookingDetailTile
        label="Total price"
        value={formatMoney(booking.total_price)}
        subtext={booking.duration_days ? `${booking.duration_days} day${booking.duration_days > 1 ? 's' : ''}` : 'Trip'}
        className="rounded-2xl bg-slate-50 p-3.5 md:min-w-[160px]"
      />
    </div>
  )
}

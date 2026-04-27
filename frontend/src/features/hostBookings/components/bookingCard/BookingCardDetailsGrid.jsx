import BookingDetailTile from '../../../../components/bookings/BookingDetailTile'
import { formatDate, formatDateTime } from '../../utils/bookingFormatters'

export default function BookingCardDetailsGrid({ booking }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <BookingDetailTile
        label="Trip dates"
        value={`${formatDate(booking.start_date)} → ${formatDate(booking.end_date)}`}
      />
      <BookingDetailTile
        label="Duration"
        value={`${booking.duration_days} day${booking.duration_days !== 1 ? 's' : ''}`}
      />
      <BookingDetailTile
        label="Earnings"
        value={`${booking.total_price} kr`}
        subtext={`${booking.price_per_day} kr / day`}
      />
      <BookingDetailTile label="Requested" value={formatDateTime(booking.created_at)} />
    </div>
  )
}

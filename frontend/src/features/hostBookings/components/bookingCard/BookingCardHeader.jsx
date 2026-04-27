import BookingCardImageThumb from '../../../../components/bookings/BookingCardImageThumb'
import { statusBadgeClass, formatBoatType } from '../../utils/bookingFormatters'

export default function BookingCardHeader({ booking, isCancelled }) {
  return (
    <div className="flex items-start justify-between gap-4 pr-14">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
              booking.status
            )}`}
          >
            {booking.status}
          </span>
        </div>

        <h2 className="mt-2 text-lg font-bold text-slate-900 md:text-xl">{booking.boat_title}</h2>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
          <span>{booking.boat_location || 'Location unavailable'}</span>
          <span>{formatBoatType(booking.boat_type)}</span>
          <span>{booking.boat_guests} guests</span>
        </div>
      </div>

      <BookingCardImageThumb
        image={booking.boat_image}
        alt={booking.boat_title}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-24 sm:w-24"
        overlay={isCancelled ? <div className="absolute inset-0 bg-white/70" /> : null}
      />
    </div>
  )
}

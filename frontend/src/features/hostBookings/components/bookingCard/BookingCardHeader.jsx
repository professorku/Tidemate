import BookingCardImageThumb from '../../../../components/bookings/BookingCardImageThumb'
import { statusBadgeClass, formatBoatType } from '../../utils/bookingFormatters'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../../utils/locationPrivacy'

export default function BookingCardHeader({ booking, isCancelled }) {
  const hasExactLocation = canShowExactLocation(booking)
  const locationLabel = getBoatLocationLabel(booking, 'Location unavailable')
  const publicLocationLabel = getBoatPublicLocationLabel(booking, '')

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

          {hasExactLocation ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Exact pickup visible
            </span>
          ) : null}
        </div>

        <h2 className="mt-2 text-lg font-bold text-slate-900 md:text-xl">
          {booking.boat_title}
        </h2>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
          <span>{locationLabel}</span>
          <span>{formatBoatType(booking.boat_type)}</span>
          <span>{booking.boat_guests} guests</span>
        </div>

        {hasExactLocation && publicLocationLabel && publicLocationLabel !== locationLabel ? (
          <p className="mt-1 text-xs text-slate-500">
            Public area: {publicLocationLabel}
          </p>
        ) : null}
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
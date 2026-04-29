import { statusBadgeClass } from '../utils/bookingFormatters'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../utils/locationPrivacy'

export default function BookingHero({ booking, summaryText }) {
  const hasExactLocation = canShowExactLocation(booking)
  const locationLabel = getBoatLocationLabel(booking, 'Location unavailable')
  const publicLocationLabel = getBoatPublicLocationLabel(booking, '')

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="h-44 w-full shrink-0 bg-slate-100 md:h-auto md:w-64">
          {booking.boat_image ? (
            <img
              src={booking.boat_image}
              alt={booking.boat_title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No booking image available
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy">
                Your trip
              </p>

              <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                {booking.boat_title}
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                {locationLabel}
              </p>

              {hasExactLocation && publicLocationLabel && publicLocationLabel !== locationLabel ? (
                <p className="mt-1 text-xs text-slate-500">
                  Public area: {publicLocationLabel}
                </p>
              ) : null}

              <p className="mt-3 text-sm text-slate-700 md:text-base">
                {summaryText}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${statusBadgeClass(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>

              {hasExactLocation ? (
                <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Exact pickup visible
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
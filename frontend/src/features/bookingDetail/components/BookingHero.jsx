import { statusBadgeClass } from '../utils/bookingFormatters'

export default function BookingHero({ booking, summaryText }) {
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

              <p className="mt-2 text-sm text-slate-600">
                {booking.boat_location || 'Location unavailable'}
              </p>

              <p className="mt-3 text-sm text-slate-700 md:text-base">
                {summaryText}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${statusBadgeClass(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
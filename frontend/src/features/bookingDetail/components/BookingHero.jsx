import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import {
  formatStatusLabel,
  getBookingHint,
  getLifecycleLabel,
  statusBadgeClass,
} from '../utils/bookingFormatters'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../utils/locationPrivacy'

function DetailPill({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/15 backdrop-blur">
      {icon}
      <span className="text-white/65">{label}</span>
      <span className="truncate font-bold">{value}</span>
    </div>
  )
}

export default function BookingHero({ booking, summaryText, viewerRole = 'renter' }) {
  const hasExactLocation = canShowExactLocation(booking)
  const locationLabel = getBoatLocationLabel(booking, 'Location unavailable')
  const publicLocationLabel = getBoatPublicLocationLabel(booking, '')
  const viewerLabel = viewerRole === 'host' ? 'Host view' : 'Renter view'

  return (
    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-slate-950 shadow-soft">
      <div className="relative min-h-[360px]">
        {booking.boat_image ? (
          <img
            src={booking.boat_image}
            alt={booking.boat_title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-ocean to-slate-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent" />

        <div className="relative flex min-h-[360px] flex-col justify-between p-5 text-white md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${statusBadgeClass(
                  booking.status
                )}`}
              >
                {formatStatusLabel(booking.status)}
              </span>

              <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 backdrop-blur">
                {getLifecycleLabel(booking)}
              </span>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90 ring-1 ring-white/15 backdrop-blur">
              <UserCircleIcon className="h-4 w-4" />
              {viewerLabel}
            </span>
          </div>

          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
              Booking #{booking.id}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
              {booking.boat_title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
              {getBookingHint(booking, viewerRole)}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <DetailPill
                icon={<CalendarDaysIcon className="h-4 w-4 text-gold" />}
                label="Trip"
                value={summaryText}
              />

              <DetailPill
                icon={<MapPinIcon className="h-4 w-4 text-gold" />}
                label={hasExactLocation ? 'Pickup' : 'Area'}
                value={locationLabel}
              />

              <DetailPill
                icon={<ClockIcon className="h-4 w-4 text-gold" />}
                label="Status"
                value={formatStatusLabel(booking.status)}
              />
            </div>

            {hasExactLocation ? (
              <div className="mt-4 inline-flex max-w-full items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
                <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  Exact pickup details are visible for this booking.
                  {publicLocationLabel && publicLocationLabel !== locationLabel
                    ? ` Public area: ${publicLocationLabel}.`
                    : ''}
                </span>
              </div>
            ) : (
              <div className="mt-4 inline-flex max-w-full items-start gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/85 ring-1 ring-white/15 backdrop-blur">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span>Exact pickup details unlock when the booking is confirmed.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
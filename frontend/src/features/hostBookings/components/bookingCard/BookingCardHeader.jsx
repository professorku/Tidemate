import {
  LifebuoyIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import {
  formatBoatType,
  formatStatusLabel,
  statusBadgeClass,
} from '../../utils/bookingFormatters'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../../utils/locationPrivacy'

export default function BookingCardHeader({ booking }) {
  const hasExactLocation = canShowExactLocation(booking)
  const locationLabel = getBoatLocationLabel(booking, 'Location unavailable')
  const publicLocationLabel = getBoatPublicLocationLabel(booking, '')

  return (
    <div className="pr-12">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusBadgeClass(
            booking.status
          )}`}
        >
          {formatStatusLabel(booking.status)}
        </span>

        {booking.status === 'pending' ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-100">
            Needs response
          </span>
        ) : null}

        {hasExactLocation ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Exact pickup visible
          </span>
        ) : null}
      </div>

      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
        {booking.boat_title || 'Boat'}
      </h3>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <MapPinIcon className="h-4 w-4 text-slate-400" />
          {locationLabel}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <LifebuoyIcon className="h-4 w-4 text-slate-400" />
          {formatBoatType(booking.boat_type)}
        </span>

        {booking.boat_guests ? (
          <span className="inline-flex items-center gap-1.5">
            <UserGroupIcon className="h-4 w-4 text-slate-400" />
            Up to {booking.boat_guests} guests
          </span>
        ) : null}
      </div>

      {hasExactLocation && publicLocationLabel && publicLocationLabel !== locationLabel ? (
        <p className="mt-1.5 text-xs text-slate-500">
          Public area: {publicLocationLabel}
        </p>
      ) : null}
    </div>
  )
}
import { Link } from 'react-router-dom'
import {
  LifebuoyIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import {
  formatBoatType,
  formatStatusLabel,
  statusClasses,
} from '../utils/bookingFormatters'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../utils/locationPrivacy'

export default function BookingCardHeader({ booking, timelineStatus }) {
  const hasExactLocation = canShowExactLocation(booking)
  const locationLabel = getBoatLocationLabel(booking, 'Location not set')
  const publicLocationLabel = getBoatPublicLocationLabel(booking, '')

  return (
    <div className="pr-12">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
            booking.status
          )}`}
        >
          {formatStatusLabel(booking.status)}
        </span>

        {hasExactLocation ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Exact pickup visible
          </span>
        ) : null}

        {timelineStatus === 'pending' ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
            Host needs to approve
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
        {booking.boat_title || 'Boat'}
      </h3>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
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
        <p className="mt-2 text-xs text-slate-500">
          Public area: {publicLocationLabel}
        </p>
      ) : null}

      <p className="mt-3 text-sm text-slate-600">
        Hosted by{' '}
        {booking.host_id ? (
          <Link
            to={`/users/${booking.host_id}`}
            className="font-bold text-navy hover:underline"
          >
            {booking.host_username || 'Host'}
          </Link>
        ) : (
          <span className="font-bold text-slate-800">
            {booking.host_username || 'Host'}
          </span>
        )}
      </p>
    </div>
  )
}
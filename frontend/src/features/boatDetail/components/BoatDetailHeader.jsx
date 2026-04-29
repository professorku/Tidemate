import { Link } from 'react-router-dom'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatLocationSubtitle,
  getBoatPublicLocationLabel,
} from '../../../utils/locationPrivacy'

export default function BoatDetailHeader({ boat, reviewsData }) {
  const hasExactLocation = canShowExactLocation(boat)
  const locationLabel = getBoatLocationLabel(boat)
  const publicLocationLabel = getBoatPublicLocationLabel(boat)
  const locationSubtitle = getBoatLocationSubtitle(boat)

  return (
    <div className="mt-5 rounded-[22px] bg-white p-5 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            {boat.title}
          </h1>

          <p className="mt-2 text-sm text-slate-600 md:text-base">
            {locationLabel}
          </p>

          {hasExactLocation && publicLocationLabel && publicLocationLabel !== locationLabel ? (
            <p className="mt-1 text-sm text-slate-500">
              Public area: {publicLocationLabel}
            </p>
          ) : null}
        </div>

        <div className="rounded-[18px] bg-mist px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {boat.price_per_day} kr/day
          </p>
        </div>
      </div>

      {hasExactLocation && locationSubtitle ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Private pickup instructions
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
            {locationSubtitle}
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-slate-700">
          {boat.boat_type}
        </span>

        <span className="rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-slate-700">
          {boat.guests} guests
        </span>

        <Link
          to={`/users/${boat.host_id}`}
          className="rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
        >
          Host: {boat.host_name}
        </Link>

        <span className="rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-slate-700">
          {reviewsData.average_rating
            ? `★ ${reviewsData.average_rating.toFixed(1)}`
            : 'New'}
          {' · '}
          {reviewsData.review_count} review
          {reviewsData.review_count === 1 ? '' : 's'}
        </span>

        {hasExactLocation ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Exact pickup visible
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Approximate location
          </span>
        )}
      </div>
    </div>
  )
}
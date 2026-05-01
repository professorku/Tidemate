import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  HeartIcon,
  LifebuoyIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import FavoriteButton from '../../../components/BoatCard/FavoriteButton'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatLocationSubtitle,
  getBoatPublicLocationLabel,
} from '../../../utils/locationPrivacy'
import {
  formatBoatTypeLabel,
  formatMoney,
  formatRatingSummary,
  getGuestLabel,
} from '../utils/boatDetailFormatters'

function HeaderPill({ icon, children, tone = 'neutral' }) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-slate-200 bg-white text-slate-700'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm ${toneClass}`}
    >
      {icon}
      {children}
    </span>
  )
}

export default function BoatDetailHeader({
  boat,
  reviewsData,
  isOwner = false,
  onFavoriteChange,
}) {
  const hasExactLocation = canShowExactLocation(boat)
  const locationLabel = getBoatLocationLabel(boat, 'Location available after booking')
  const publicLocationLabel = getBoatPublicLocationLabel(boat, '')
  const locationSubtitle = getBoatLocationSubtitle(boat)

  return (
    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-br from-white via-sky-50 to-white px-5 py-6 md:px-7 md:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <HeaderPill icon={<LifebuoyIcon className="h-4 w-4 text-navy" />}>
                {formatBoatTypeLabel(boat.boat_type)}
              </HeaderPill>

              <HeaderPill icon={<UserGroupIcon className="h-4 w-4 text-navy" />}>
                {getGuestLabel(boat.guests)}
              </HeaderPill>

              <HeaderPill icon={<StarIcon className="h-4 w-4 text-gold" />}>
                {formatRatingSummary(reviewsData)}
              </HeaderPill>

              {hasExactLocation ? (
                <HeaderPill
                  tone="success"
                  icon={<ShieldCheckIcon className="h-4 w-4" />}
                >
                  Exact pickup visible
                </HeaderPill>
              ) : (
                <HeaderPill
                  tone="warning"
                  icon={<MapPinIcon className="h-4 w-4" />}
                >
                  Approximate area
                </HeaderPill>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              {boat.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-slate-400" />
                {locationLabel}
              </span>

              <Link
                to={`/users/${boat.host_id}`}
                className="inline-flex items-center gap-2 font-semibold text-navy transition hover:underline"
              >
                <UserCircleIcon className="h-4 w-4" />
                Hosted by {boat.host_name || 'Host'}
              </Link>

              <span className="inline-flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                Request dates from the booking card
              </span>
            </div>

            {hasExactLocation && publicLocationLabel && publicLocationLabel !== locationLabel ? (
              <p className="mt-2 text-sm text-slate-500">
                Public area: {publicLocationLabel}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:min-w-[240px]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Price
            </p>

            <div>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatMoney(boat.price_per_day)}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">per day</p>
            </div>

            {!isOwner ? (
              <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                <FavoriteButton
                  boat={boat}
                  onFavoriteChange={onFavoriteChange}
                  className="!h-10 !w-10 border border-slate-200 !bg-white"
                />

                <div>
                  <p className="text-sm font-bold text-slate-900">Save listing</p>
                  <p className="text-xs text-slate-500">
                    Add this boat to your favorites
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
                <HeartIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                This is your own listing.
              </div>
            )}
          </div>
        </div>
      </div>

      {hasExactLocation && locationSubtitle ? (
        <div className="px-5 py-5 md:px-7">
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Private pickup instructions
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-emerald-900">
              {locationSubtitle}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
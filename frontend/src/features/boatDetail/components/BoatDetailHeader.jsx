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
      ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'
      : tone === 'warning'
        ? 'border-gold/30 bg-gold/10 text-gold'
        : 'border-gold/20 bg-[#071d32]/70 text-white/80'

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
    <section className="overflow-hidden rounded-[34px] border border-gold/20 bg-navy shadow-soft">
      <div className="border-b border-gold/10 px-5 py-6 md:px-7 md:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <HeaderPill icon={<LifebuoyIcon className="h-4 w-4 text-gold" />}>
                {formatBoatTypeLabel(boat.boat_type)}
              </HeaderPill>

              <HeaderPill icon={<UserGroupIcon className="h-4 w-4 text-gold" />}>
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

            <h1 className="mt-5 max-w-4xl break-words text-3xl font-extrabold leading-[1.08] tracking-tight text-white md:text-4xl xl:text-[2.75rem]">
              {boat.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-gold" />
                {locationLabel}
              </span>

              <Link
                to={`/users/${boat.host_id}`}
                className="inline-flex items-center gap-2 font-semibold text-gold transition hover:text-gold/80"
              >
                <UserCircleIcon className="h-4 w-4" />
                Hosted by {boat.host_name || 'Host'}
              </Link>

              <span className="inline-flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-gold" />
                Request dates from the booking card
              </span>
            </div>

            {hasExactLocation && publicLocationLabel && publicLocationLabel !== locationLabel ? (
              <p className="mt-2 text-sm text-white/55">
                Public area: {publicLocationLabel}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-3 rounded-[28px] border border-gold/20 bg-[#071d32]/80 p-4 shadow-sm lg:min-w-[240px]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Price
            </p>

            <div>
              <p className="text-3xl font-extrabold tracking-tight text-white">
                {formatMoney(boat.price_per_day)}
              </p>
              <p className="mt-1 text-sm font-medium text-white/55">per day</p>
            </div>

            {!isOwner ? (
              <div className="flex items-center gap-2 border-t border-gold/10 pt-3">
                <FavoriteButton
                  boat={boat}
                  onFavoriteChange={onFavoriteChange}
                  className="!h-10 !w-10 border border-gold/20 !bg-white"
                />

                <div>
                  <p className="text-sm font-bold text-white">Save listing</p>
                  <p className="text-xs text-white/55">
                    Add this boat to your favorites
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 border-t border-gold/10 pt-3 text-sm text-white/65">
                <HeartIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                This is your own listing.
              </div>
            )}
          </div>
        </div>
      </div>

      {hasExactLocation && locationSubtitle ? (
        <div className="px-5 py-5 md:px-7">
          <div className="rounded-[24px] border border-emerald-300/25 bg-emerald-400/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
              Private pickup instructions
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-emerald-50">
              {locationSubtitle}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
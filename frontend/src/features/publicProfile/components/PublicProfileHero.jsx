import {
  CalendarDaysIcon,
  MapPinIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

function InfoPill({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#071d32]/80 px-3 py-2 text-sm font-bold text-white/75 shadow-sm">
      <span className="text-gold">{icon}</span>
      <span>{text}</span>
    </span>
  )
}

export default function PublicProfileHero({
  profile,
  initials,
  joinedText,
  reviewCount,
  averageRating,
  actions = null,
}) {
  const displayName = profile.display_name || profile.username || 'TideMate user'

  return (
    <div className="relative overflow-hidden border-b border-white/15 px-6 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-ocean/40 blur-3xl" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={displayName}
              decoding="async"
              fetchPriority="high"
              className="h-28 w-28 rounded-full border-4 border-gold object-cover shadow-lg ring-1 ring-gold/40 md:h-32 md:w-32"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-gold bg-[#071d32] text-4xl font-extrabold text-white shadow-lg ring-1 ring-gold/40 md:h-32 md:w-32">
              {initials}
            </div>
          )}

          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
              Public profile
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-5xl">
              {displayName}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <InfoPill
                icon={<MapPinIcon className="h-4 w-4" />}
                text={profile.location || 'No location added'}
              />

              <InfoPill
                icon={<CalendarDaysIcon className="h-4 w-4" />}
                text={`Joined ${joinedText}`}
              />

              <InfoPill
                icon={<StarIcon className="h-4 w-4" />}
                text={reviewCount > 0 ? `${Number(averageRating).toFixed(1)} rating` : 'No reviews yet'}
              />
            </div>

            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/70 md:text-base">
              {profile.bio
                ? profile.bio
                : `${displayName} has not added a bio yet. You can still browse their listed boats and reviews below.`}
            </p>
          </div>
        </div>

        {actions}
      </div>
    </div>
  )
}
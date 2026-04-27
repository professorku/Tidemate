import {
  CalendarDaysIcon,
  MapPinIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

function InfoPill({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
      {icon}
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
  return (
    <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="h-24 w-24 rounded-[26px] border border-slate-200 object-cover md:h-28 md:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-[26px] border border-slate-200 bg-slate-100 text-3xl font-extrabold text-slate-700 md:h-28 md:w-28">
              {initials}
            </div>
          )}

          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Public profile
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              {profile.username}
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

            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-600 md:text-base">
              {profile.bio
                ? profile.bio
                : `${profile.username} has not added a bio yet. You can still browse their listed boats and reviews below.`}
            </p>
          </div>
        </div>

        {actions}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import {
  CameraIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  LifebuoyIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  ShieldCheckIcon,
  StarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import {
  formatAverageRating,
  formatMemberSince,
} from '../utils/profileFormatters'

function Badge({ children, icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-navy px-3 py-1.5 text-xs font-bold text-white/80 shadow-sm">
      {icon}
      {children}
    </span>
  )
}

function CompletionBar({ value }) {
  return (
    <div className="rounded-[24px] border border-white/20 bg-navy p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-white">Profile completion</p>
        <p className="text-sm font-extrabold text-gold">{value}%</p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default function ProfileHero({
  profile,
  initials,
  profileCompletion,
  missingProfileItems = [],
  reviewsData,
  uploading,
  onAvatarChange,
}) {
  const averageRating = formatAverageRating(reviewsData.average_rating)
  const hasMissingItems = missingProfileItems.length > 0

  return (
    <section className="overflow-hidden rounded-[34px] border border-navy bg-navy text-white shadow-soft">
      <div className="border-b border-white/15 px-6 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="relative shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="h-32 w-32 rounded-full border-4 border-gold object-cover shadow-lg ring-1 ring-gold/40 md:h-36 md:w-36"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold bg-navy text-4xl font-extrabold text-white shadow-lg ring-1 ring-gold/40 md:h-36 md:w-36">
                  {initials}
                </div>
              )}

              <label className="absolute bottom-1 right-1 flex cursor-pointer items-center gap-2 rounded-full bg-gold px-3 py-2 text-xs font-extrabold text-navy shadow-md ring-1 ring-gold/40 transition hover:bg-[#d8b45d]">
                <CameraIcon className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap gap-2">
                <Badge icon={<CalendarDaysIcon className="h-4 w-4 text-gold" />}>
                  Member since {formatMemberSince(profile.member_since)}
                </Badge>

                {profile.is_host ? (
                  <Badge icon={<LifebuoyIcon className="h-4 w-4 text-gold" />}>
                    Host
                  </Badge>
                ) : null}

                {profile.is_renter ? (
                  <Badge icon={<UserCircleIcon className="h-4 w-4 text-gold" />}>
                    Renter
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-4 truncate text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                {profile.username}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
                <span className="inline-flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-gold" />
                  {profile.location || 'Location not added'}
                </span>

                <span className="inline-flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-gold" />
                  {averageRating}
                </span>
              </div>
            </div>
          </div>

          <CompletionBar value={profileCompletion} />
        </div>
      </div>

      <div className="px-6 py-5 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            {hasMissingItems ? (
              <div className="flex items-start gap-3 rounded-[22px] border border-gold/40 bg-navy px-4 py-3 text-sm text-white shadow-sm">
                <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-bold text-white">Complete your profile</p>
                  <p className="mt-1 leading-6 text-white/70">
                    Add {missingProfileItems.join(', ')} to make your account look more
                    trustworthy.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-[22px] border border-white/20 bg-navy px-4 py-3 text-sm text-white shadow-sm">
                <CheckBadgeIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-bold text-white">Profile looks good</p>
                  <p className="mt-1 leading-6 text-white/70">
                    Your profile has the main information renters and hosts need.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/profile/edit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Edit profile
            </Link>

            <Link
              to="/messages"
              className="inline-flex items-center justify-cen ter gap-2 rounded-full border border-white/25 bg-navy px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Messages
            </Link>

            <Link
              to="/add-boat"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean"
            >
              <PlusIcon className="h-5 w-5" />
              List a boat
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 
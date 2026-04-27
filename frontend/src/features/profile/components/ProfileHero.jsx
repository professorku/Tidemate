import { Link } from 'react-router-dom'
import {
  CameraIcon,
  InboxIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { formatMemberSince } from '../utils/profileFormatters'

export default function ProfileHero({
  profile,
  initials,
  profileCompletion,
  reviewsData,
  uploading,
  error,
  onAvatarChange,
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 md:h-44" />

      <div className="relative px-6 pb-6 md:px-8 md:pb-8">
        <div className="-mt-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg md:h-36 md:w-36"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-navy text-4xl font-extrabold text-white shadow-lg md:h-36 md:w-36">
                  {initials}
                </div>
              )}

              <label className="absolute bottom-1 right-1 flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-md transition hover:bg-slate-50">
                <CameraIcon className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Change'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-slate-700">
                  Member since {formatMemberSince(profile.member_since)}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Profile {profileCompletion}% complete
                </span>
              </div>

              <h1 className="mt-4 truncate text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                {profile.username}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                {profile.location ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    {profile.location}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    Add your location
                  </span>
                )}

                <span className="inline-flex items-center gap-2">
                  <StarIcon className="h-4 w-4" />
                  {reviewsData.average_rating
                    ? `${Number(reviewsData.average_rating).toFixed(1)} average rating`
                    : 'No ratings yet'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Edit profile
            </Link>

            <Link
              to="/messages"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <InboxIcon className="h-5 w-5" />
              Messages
            </Link>

            <Link
              to="/add-boat"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:brightness-95"
            >
              <PlusIcon className="h-5 w-5" />
              List a boat
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  )
}

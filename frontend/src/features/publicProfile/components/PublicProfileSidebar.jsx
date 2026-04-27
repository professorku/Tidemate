import {
  CalendarDaysIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

import { formatMemberSince } from '../../../utils/format/date'

function SidebarRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export default function PublicProfileSidebar({
  profile,
  reviewsData,
  boats,
  isMe,
  isCrewmate,
  isBlocked,
}) {
  const reviewCount = reviewsData?.review_count || 0
  const averageRating =
    typeof reviewsData?.average_rating === 'number'
      ? reviewsData.average_rating.toFixed(1)
      : null

  return (
    <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold text-slate-900">Profile snapshot</h2>
        <div className="mt-5 space-y-3">
          <SidebarRow
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            label="Member since"
            value={formatMemberSince(profile.member_since)}
          />
          <SidebarRow
            icon={<MapPinIcon className="h-5 w-5" />}
            label="Location"
            value={profile.location || 'Not added'}
          />
          <SidebarRow
            icon={<StarIcon className="h-5 w-5" />}
            label="Rating"
            value={
              reviewCount > 0
                ? `${averageRating} from ${reviewCount} review${reviewCount === 1 ? '' : 's'}`
                : 'No reviews yet'
            }
          />
          <SidebarRow
            icon={<ShieldCheckIcon className="h-5 w-5" />}
            label="Boats listed"
            value={`${boats.length} public boat${boats.length === 1 ? '' : 's'}`}
          />
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-slate-900">Good to know</h2>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            Public profiles show host information, listed boats, and profile reviews.
          </div>

          {!isMe ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              {isBlocked
                ? 'You have blocked this user, so some interactions are limited.'
                : isCrewmate
                ? 'This user is currently in your crew.'
                : 'You can message this user or add them to your crew from the top section.'}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              This is how other users see your public profile.
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
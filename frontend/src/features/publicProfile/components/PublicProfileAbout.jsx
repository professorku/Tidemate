import {
  CalendarDaysIcon,
  MapPinIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { formatMemberSince } from '../../../utils/format/date'

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function PublicProfileAbout({ profile, boats, reviewsData }) {
  const boatCount = boats?.length || 0
  const reviewCount = reviewsData?.review_count || 0
  const averageRating =
    typeof reviewsData?.average_rating === 'number'
      ? reviewsData.average_rating.toFixed(1)
      : null

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            About
          </p>
        </div>

        <p className="text-sm text-slate-500">
          {boatCount} boat{boatCount === 1 ? '' : 's'} · {reviewCount} review
          {reviewCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <div className="rounded-[28px] bg-slate-50 p-6">
          <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700">
            {profile.bio ||
              `${profile.username} has not added a detailed bio yet. Reviews and listed boats can still help renters get a feel for this host.`}
          </p>
        </div>

        <div className="space-y-3">
          <InfoRow
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            label="Member since"
            value={formatMemberSince(profile.member_since)}
          />
          <InfoRow
            icon={<MapPinIcon className="h-5 w-5" />}
            label="Location"
            value={profile.location || 'Not added'}
          />
          <InfoRow
            icon={<StarIcon className="h-5 w-5" />}
            label="Rating"
            value={
              reviewCount > 0
                ? `${averageRating} from ${reviewCount} review${reviewCount === 1 ? '' : 's'}`
                : 'No reviews yet'
            }
          />
        </div>
      </div>
    </section>
  )
}

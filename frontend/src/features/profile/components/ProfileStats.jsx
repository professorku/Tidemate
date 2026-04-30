import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  LifebuoyIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import StatCard from '../../../components/ui/StatCard'
import { formatAverageRating } from '../utils/profileFormatters'

export default function ProfileStats({
  profile,
  boats,
  reviewsData,
  profileCompletion,
}) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Profile"
        value={`${profileCompletion}%`}
        text="Completion score"
        icon={<SparklesIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Boats listed"
        value={profile.stats?.boats_listed ?? boats.length}
        text="Your active hosting listings"
        icon={<LifebuoyIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Bookings made"
        value={profile.stats?.bookings_made ?? 0}
        text="Trips you have requested"
        icon={<CalendarDaysIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Confirmed trips"
        value={profile.stats?.confirmed_trips ?? 0}
        text="Approved or completed journeys"
        icon={<CheckBadgeIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Rating"
        value={formatAverageRating(reviewsData.average_rating, { compact: true })}
        text={`${reviewsData.review_count ?? 0} review${
          reviewsData.review_count === 1 ? '' : 's'
        }`}
        icon={<StarIcon className="h-5 w-5" />}
      />
    </section>
  )
}
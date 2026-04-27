import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  LifebuoyIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import StatCard from '../../../components/ui/StatCard'

export default function ProfileStats({ profile, boats, reviewsData }) {
  return (
    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        text="Completed or approved journeys"
        icon={<CheckBadgeIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Reviews"
        value={reviewsData.review_count ?? 0}
        text="Feedback from other users"
        icon={<StarIcon className="h-5 w-5" />}
      />
    </section>
  )
}

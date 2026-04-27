import { CalendarDaysIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import StatCard from '../../../components/ui/StatCard'

export default function PublicProfileStats({ joinedText, reviewCount, averageRating, boatCount }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        icon={<CalendarDaysIcon className="h-6 w-6" />}
        size="highlight"
        label="Member since"
        value={joinedText}
        text="When this host joined Boatbnb"
      />
      <StatCard
        icon={<StarIcon className="h-6 w-6" />}
        size="highlight"
        label="Reviews"
        value={reviewCount > 0 ? `${Number(averageRating).toFixed(1)} / 5` : 'No reviews yet'}
        text={`${reviewCount} total review${reviewCount === 1 ? '' : 's'}`}
      />
      <StatCard
        icon={<UserGroupIcon className="h-6 w-6" />}
        size="highlight"
        label="Boats listed"
        value={`${boatCount} boat${boatCount === 1 ? '' : 's'}`}
        text="Public boats currently available"
      />
    </div>
  )
}

import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  InboxStackIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import StatCard from '../../../components/ui/StatCard'

export default function BookingsStats({ counts, loading = false }) {
  const value = (number) => (loading ? '—' : number ?? 0)

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="All bookings"
        value={value(counts.all)}
        text="Everything in your renter account"
        icon={<InboxStackIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Pending"
        value={value(counts.pending)}
        text="Waiting for host approval"
        icon={<ClockIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Upcoming"
        value={value(counts.upcoming)}
        text="Confirmed future trips"
        icon={<CalendarDaysIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Completed"
        value={value(counts.completed)}
        text="Finished boat trips"
        icon={<CheckBadgeIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Cancelled"
        value={value(counts.cancelled)}
        text="Trips that did not continue"
        icon={<XCircleIcon className="h-5 w-5" />}
      />
    </section>
  )
}
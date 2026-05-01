import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClockIcon,
  InboxStackIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import StatCard from '../../../components/ui/StatCard'

export default function HostBookingsStats({ stats = {}, loading = false }) {
  const value = (number) => (loading ? '—' : number ?? 0)

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="All host bookings"
        value={value(stats.all)}
        text="Every request received"
        icon={<InboxStackIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Pending requests"
        value={value(stats.pending)}
        text="Waiting for your response"
        icon={<ClockIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Confirmed trips"
        value={value(stats.confirmed)}
        text="Accepted rentals"
        icon={<CheckBadgeIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Cancelled"
        value={value(stats.cancelled)}
        text="Cancelled reservations"
        icon={<XCircleIcon className="h-5 w-5" />}
      />
    </section>
  )
}
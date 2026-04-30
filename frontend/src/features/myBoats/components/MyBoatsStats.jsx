import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import StatCard from '../../../components/ui/StatCard'

export default function MyBoatsStats({ totalBoats = 0, stats, loading = false }) {
  const value = (number) => (loading ? '—' : number ?? 0)

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Active listings"
        value={value(totalBoats)}
        text="Boats available in your host account."
        icon={<HomeIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Pending requests"
        value={value(stats?.pending)}
        text="Requests waiting for your response."
        icon={<ClockIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Confirmed bookings"
        value={value(stats?.confirmed)}
        text="Accepted rentals for your boats."
        icon={<CheckCircleIcon className="h-5 w-5" />}
      />

      <StatCard
        label="Total host bookings"
        value={value(stats?.all)}
        text="All requests, confirmed, and cancelled."
        icon={<CalendarDaysIcon className="h-5 w-5" />}
      />
    </section>
  )
}
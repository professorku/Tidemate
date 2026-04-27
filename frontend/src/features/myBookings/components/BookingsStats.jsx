import StatCard from '../../../components/ui/StatCard'

export default function BookingsStats({ counts }) {
  return (
    <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard
        label="Upcoming trips"
        value={counts.upcoming}
        text="Confirmed future bookings"
      />
      <StatCard
        label="Pending requests"
        value={counts.pending}
        text="Waiting for host approval"
      />
      <StatCard
        label="Active trips"
        value={counts.active}
        text="Currently happening now"
      />
      <StatCard
        label="Completed trips"
        value={counts.completed}
        text="Finished bookings"
      />
    </section>
  )
}

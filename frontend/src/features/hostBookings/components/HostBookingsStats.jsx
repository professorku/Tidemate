import StatCard from '../../../components/ui/StatCard'

export default function HostBookingsStats({ stats = {} }) {
  const items = [
    {
      label: 'Pending requests',
      value: stats.pending ?? 0,
      text: 'Awaiting your response',
    },
    {
      label: 'Confirmed trips',
      value: stats.confirmed ?? 0,
      text: 'Accepted bookings',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled ?? 0,
      text: 'Cancelled reservations',
    },
    {
      label: 'Total bookings',
      value: stats.all ?? 0,
      text: 'All requests received',
    },
  ]

  return (
    <section className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} text={item.text} />
      ))}
    </section>
  )
}

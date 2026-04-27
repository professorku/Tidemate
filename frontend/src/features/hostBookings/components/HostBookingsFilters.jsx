import SectionHeader from '../../../components/ui/SectionHeader'
import FilterTabs from '../../../components/ui/FilterTabs'

export default function HostBookingsFilters({ activeTab, stats, onChange }) {
  const tabs = [
    { key: 'all', label: 'All', count: stats.all ?? 0 },
    { key: 'pending', label: 'Pending', count: stats.pending ?? 0 },
    { key: 'confirmed', label: 'Confirmed', count: stats.confirmed ?? 0 },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled ?? 0 },
  ]

  return (
    <section className="mt-6">
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Filter bookings"
          description="Switch between all, pending, confirmed, and cancelled bookings."
        />

        <FilterTabs tabs={tabs} activeKey={activeTab} onChange={onChange} showCount />
      </div>
    </section>
  )
}

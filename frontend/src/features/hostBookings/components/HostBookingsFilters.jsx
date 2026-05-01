import FilterTabs from '../../../components/ui/FilterTabs'
import { hostBookingTabs } from '../utils/bookingFormatters'

export default function HostBookingsFilters({ activeTab, stats, onChange }) {
  const tabs = hostBookingTabs.map((tab) => ({
    ...tab,
    count: stats[tab.key] ?? 0,
  }))

  return (
    <div className="max-w-full overflow-x-auto">
      <FilterTabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={onChange}
        showCount
        className="min-w-max lg:min-w-0 lg:justify-end"
      />
    </div>
  )
}
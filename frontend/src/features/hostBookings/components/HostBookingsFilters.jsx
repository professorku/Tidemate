import FilterTabs from '../../../components/ui/FilterTabs'
import { hostBookingTabs } from '../utils/hostBookingFormatters'

export default function HostBookingsFilters({ activeTab, stats = {}, onChange }) {
  const tabs = hostBookingTabs.map((tab) => ({
    ...tab,
    count: stats?.[tab.key] ?? 0,
  }))

  return (
    <div className="overflow-x-auto">
      <FilterTabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={onChange}
        showCount
      />
    </div>
  )
}
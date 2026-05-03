import FilterTabs from '../../../components/ui/FilterTabs'
import { hostBookingTabs } from '../utils/hostBookingFormatters'

export default function HostBookingsFilters({ activeTab, stats = {}, onChange }) {
  const tabs = hostBookingTabs.map((tab) => ({
    ...tab,
    count: stats?.[tab.key] ?? 0,
  }))

  return (
    <div className="w-full overflow-x-auto px-1 py-1">
      <FilterTabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={onChange}
        showCount
        className="min-w-max flex-nowrap"
        buttonClassName="shrink-0"
      />
    </div>
  )
}
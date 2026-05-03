import FilterTabs from '../../../components/ui/FilterTabs'
import { bookingTabs } from '../utils/bookingFormatters'

export default function BookingsFilters({ activeTab, counts = {}, onChange }) {
  const tabs = bookingTabs.map((tab) => ({
    ...tab,
    count: counts?.[tab.key] ?? 0,
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
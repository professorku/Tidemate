import FilterTabs from '../../../components/ui/FilterTabs'
import { bookingTabs } from '../utils/bookingFormatters'

export default function BookingsFilters({ activeTab, counts, onChange }) {
  const tabs = bookingTabs.map((tab) => ({
    ...tab,
    count: counts[tab.key],
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
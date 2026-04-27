import FilterTabs from '../../../components/ui/FilterTabs'
import { bookingTabs } from '../utils/bookingFormatters'

export default function BookingsFilters({ activeTab, counts, onChange }) {
  const tabs = bookingTabs.map((tab) => ({
    ...tab,
    count: counts[tab.key],
  }))

  return (
    <section className="mt-6">
      <FilterTabs tabs={tabs} activeKey={activeTab} onChange={onChange} showCount />
    </section>
  )
}

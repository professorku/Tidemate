import SearchField from '../../../components/forms/SearchField'
import SectionShell from '../../../components/ui/SectionShell'
import FilterTabs from '../../../components/ui/FilterTabs'

export default function MessagesFilters({ search, onSearchChange, filter, onFilterChange, filterTabs }) {
  return (
    <SectionShell className="mt-6" padding="compact">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder="Search by boat, host, renter, or message..."
          className="w-full lg:max-w-md"
        />

        <FilterTabs tabs={filterTabs} activeKey={filter} onChange={onFilterChange} />
      </div>
    </SectionShell>
  )
}

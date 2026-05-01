import SearchField from '../../../components/forms/SearchField'
import FilterTabs from '../../../components/ui/FilterTabs'

export default function MessagesFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  filterTabs,
}) {
  return (
    <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[520px]">
      <SearchField
        value={search}
        onChange={onSearchChange}
        placeholder="Search boat, user, or message..."
        className="w-full"
      />

      <div className="overflow-x-auto">
        <FilterTabs tabs={filterTabs} activeKey={filter} onChange={onFilterChange} />
      </div>
    </div>
  )
}
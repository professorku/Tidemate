import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
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
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold" />

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search boat, user, or message..."
          className="w-full rounded-full border border-white/20 bg-[#071d32] py-3 pl-11 pr-4 text-sm font-semibold text-white shadow-sm outline-none transition placeholder:text-white/40 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div className="overflow-x-auto">
        <FilterTabs tabs={filterTabs} activeKey={filter} onChange={onFilterChange} />
      </div>
    </div>
  )
}
import { BOAT_TYPE_OPTIONS } from '../features/addBoat/constants'

export default function FiltersBar({ filters, setFilters, onApply, onClear }) {
  const inputClassName =
    'w-full rounded-xl border border-white/15 bg-[#071d32] px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20'

  const labelClassName =
    'mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-gold'

  return (
    <div className="rounded-[24px] border border-white/15 bg-navy p-3.5 shadow-soft md:p-4">
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-6">
        <div>
          <label className={labelClassName} htmlFor="filters-search">
            Search
          </label>
          <input
            id="filters-search"
            name="q"
            className={inputClassName}
            placeholder="Search title or location"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="filters-boat-type">
            Boat type
          </label>
          <select
            id="filters-boat-type"
            name="boat_type"
            className={inputClassName}
            value={filters.boat_type}
            onChange={(e) => setFilters({ ...filters, boat_type: e.target.value })}
          >
            <option value="">Any type</option>
            {BOAT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="filters-min-guests">
            Min guests
          </label>
          <input
            id="filters-min-guests"
            name="min_guests"
            type="number"
            min="1"
            className={inputClassName}
            placeholder="Min guests"
            value={filters.min_guests}
            onChange={(e) => setFilters({ ...filters, min_guests: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="filters-min-price">
            Min price
          </label>
          <input
            id="filters-min-price"
            name="min_price"
            type="number"
            min="0"
            className={inputClassName}
            placeholder="Min price"
            value={filters.min_price}
            onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="filters-max-price">
            Max price
          </label>
          <input
            id="filters-max-price"
            name="max_price"
            type="number"
            min="0"
            className={inputClassName}
            placeholder="Max price"
            value={filters.max_price}
            onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-xl bg-gold px-3.5 py-2.5 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-xl border border-white/20 bg-navy px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
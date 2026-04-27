export default function FiltersBar({ filters, setFilters, onApply, onClear }) {
  const inputClassName = 'rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/10'
  const labelClassName = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'

  return (
    <div className="rounded-[20px] bg-white p-3.5 shadow-soft md:p-4">
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
            <option value="rib">RIB</option>
            <option value="sailboat">Sailboat</option>
            <option value="kayak">Kayak</option>
            <option value="yacht">Yacht</option>
            <option value="motorboat">Motorboat</option>
            <option value="other">Other</option>
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
            onClick={onApply}
            className="flex-1 rounded-xl bg-navy px-3.5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Apply
          </button>
          <button
            onClick={onClear}
            className="flex-1 rounded-xl bg-mist px-3.5 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-200"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

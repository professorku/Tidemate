import { XMarkIcon } from '@heroicons/react/24/outline'
import { BOAT_TYPE_OPTIONS } from '../features/addBoat/constants'

export default function FiltersBar({
  filters,
  setFilters,
  onApply,
  onClear,
  onClose,
  variant = 'default',
}) {
  const inputClassName =
    'w-full rounded-xl border border-white/15 bg-[#071d32] px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20'

  const labelClassName =
    'mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-gold'

  const isPopover = variant === 'popover'

  return (
    <div
      className={
        isPopover
          ? 'origin-top rounded-[28px] border border-gold/25 bg-navy p-4 shadow-2xl ring-1 ring-black/20 md:p-5'
          : 'rounded-[24px] border border-white/15 bg-navy p-3.5 shadow-soft md:p-4'
      }
    >
      {isPopover ? (
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-gold/10 pb-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold">
              Marketplace filters
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-white">
              Narrow down the fleet
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Filter by type, guests and price.
            </p>
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-[#071d32] p-2 text-white transition hover:border-gold/40 hover:text-gold"
              aria-label="Close filters"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
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
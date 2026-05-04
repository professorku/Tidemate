import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { BOAT_TYPE_OPTIONS } from '../../addBoat/constants'
import {
  buildSearchParamsFromFilters,
  getFiltersFromSearchParams,
  initialHomeFilters,
} from '../../home/utils/listingSearchParams'

const fieldClassName =
  'h-11 w-full rounded-2xl border border-white/15 bg-[#071d32] px-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20'

const labelClassName =
  'mb-1.5 block text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-gold'

function countActiveFilters(filters) {
  return Object.values(filters).filter((value) => String(value || '').trim()).length
}

function getTodayValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function MobileSearch() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const urlFilters = useMemo(
    () => getFiltersFromSearchParams(searchParams),
    [searchParams]
  )

  const [filters, setFilters] = useState(urlFilters)

  useEffect(() => {
    if (!isOpen) {
      setFilters(urlFilters)
    }
  }, [isOpen, urlFilters])

  useEffect(() => {
    if (!isOpen) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  const activeFilterCount = countActiveFilters(urlFilters)
  const todayValue = getTodayValue()

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
  }

  const applyFilters = (event) => {
    event.preventDefault()

    const nextParams = buildSearchParamsFromFilters(filters)
    const nextSearch = new URLSearchParams(nextParams).toString()

    setIsOpen(false)

    if (location.pathname === '/') {
      setSearchParams(nextParams)
      return
    }

    navigate(nextSearch ? `/?${nextSearch}` : '/')
  }

  const clearFilters = () => {
    setFilters(initialHomeFilters)
    setIsOpen(false)

    if (location.pathname === '/') {
      setSearchParams({})
      return
    }

    navigate('/')
  }

  return (
    <div className="flex shrink-0 md:hidden">
      <button
        type="button"
        data-testid="mobile-search-trigger"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-sm transition hover:border-gold/40 hover:text-gold"
        aria-label="Open mobile search and filters"
        aria-expanded={isOpen}
        aria-controls="mobile-search-drawer"
      >
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Open mobile search and filters</span>

        {activeFilterCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] font-extrabold text-navy ring-2 ring-navy">
            {activeFilterCount}
          </span>
        ) : null}
      </button>

      <div
        className={`fixed inset-0 z-[3200] bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      <section
        id="mobile-search-drawer"
        data-testid="mobile-search-drawer"
        className={`fixed inset-x-0 bottom-0 z-[3300] max-h-[88vh] overflow-y-auto rounded-t-[32px] border border-gold/20 bg-navy p-4 text-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="Mobile boat search"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />

        <div className="mb-4 flex items-start justify-between gap-4 border-b border-gold/10 pb-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">
              Find a boat
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              Search the fleet
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full border border-white/15 bg-[#071d32] p-2 text-white transition hover:border-gold/40 hover:text-gold"
            aria-label="Close mobile search"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={applyFilters}>
          <div>
            <label className={labelClassName} htmlFor="mobile-search-query">
              Search location or boat
            </label>
            <div className="relative">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold"
                aria-hidden="true"
              />
              <input
                id="mobile-search-query"
                value={filters.q}
                onChange={(event) => updateFilter('q', event.target.value)}
                className={`${fieldClassName} pl-10`}
                placeholder="Bodø, sailboat, fjord..."
              />
            </div>
          </div>

          <div>
            <label className={labelClassName} htmlFor="mobile-boat-type">
              Boat type
            </label>
            <select
              id="mobile-boat-type"
              value={filters.boat_type}
              onChange={(event) => updateFilter('boat_type', event.target.value)}
              className={fieldClassName}
            >
              <option value="" className="bg-navy text-white">
                Any boat type
              </option>
              {BOAT_TYPE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-navy text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClassName} htmlFor="mobile-start-date">
                Pickup date
              </label>
              <input
                id="mobile-start-date"
                type="date"
                min={todayValue}
                value={filters.start_date}
                onChange={(event) => {
                  const nextStartDate = event.target.value

                  setFilters((currentFilters) => ({
                    ...currentFilters,
                    start_date: nextStartDate,
                    end_date:
                      !nextStartDate ||
                      (currentFilters.end_date && currentFilters.end_date <= nextStartDate)
                        ? ''
                        : currentFilters.end_date,
                  }))
                }}
                className={fieldClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="mobile-end-date">
                Return date
              </label>
              <input
                id="mobile-end-date"
                type="date"
                min={filters.start_date || todayValue}
                value={filters.end_date}
                onChange={(event) => updateFilter('end_date', event.target.value)}
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClassName} htmlFor="mobile-min-guests">
                Minimum guests
              </label>
              <input
                id="mobile-min-guests"
                type="number"
                min="1"
                inputMode="numeric"
                value={filters.min_guests}
                onChange={(event) => updateFilter('min_guests', event.target.value)}
                className={fieldClassName}
                placeholder="Any"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="mobile-min-price">
                Min price
              </label>
              <input
                id="mobile-min-price"
                type="number"
                min="0"
                inputMode="numeric"
                value={filters.min_price}
                onChange={(event) => updateFilter('min_price', event.target.value)}
                className={fieldClassName}
                placeholder="0 kr"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="mobile-max-price">
                Max price
              </label>
              <input
                id="mobile-max-price"
                type="number"
                min="0"
                inputMode="numeric"
                value={filters.max_price}
                onChange={(event) => updateFilter('max_price', event.target.value)}
                className={fieldClassName}
                placeholder="No limit"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-gold/10 pt-4">
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 flex-1 rounded-full border border-white/20 px-4 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Clear
            </button>

            <button
              type="submit"
              className="inline-flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-full bg-gold px-4 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
              Show boats
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
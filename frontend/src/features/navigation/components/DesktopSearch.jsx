import { useEffect, useRef, useState } from 'react'
import BoatTypeField from './desktopSearch/BoatTypeField'
import DateRangeField from './desktopSearch/DateRangeField'
import FilterToggleButton from './desktopSearch/FilterToggleButton'
import SearchInput from './desktopSearch/SearchInput'

export default function DesktopSearch({
  query,
  setQuery,
  boatType,
  setBoatType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleSearch,
  hasMarketplaceSearch,
  filtersOpen,
  toggleFilters,
  closeFilters = () => {},
  children,
}) {
  const searchRef = useRef(null)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [datesOpen, setDatesOpen] = useState(false)

  const shouldShowExtraFields =
    searchExpanded || Boolean(boatType || startDate || endDate)

  const shouldShowFilterButton = searchExpanded || hasMarketplaceSearch || filtersOpen

  const closeDates = () => {
    setDatesOpen(false)
  }

  useEffect(() => {
    function handleDocumentMouseDown(event) {
      if (!searchRef.current?.contains(event.target)) {
        setSearchExpanded(false)
        setDatesOpen(false)
        closeFilters()
      }
    }

    document.addEventListener('mousedown', handleDocumentMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown)
    }
  }, [closeFilters])

  return (
    <div
      ref={searchRef}
      className="relative hidden min-w-0 flex-1 items-center gap-2 md:flex"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <form
          onClick={() => setSearchExpanded(true)}
          onSubmit={(event) => {
            closeDates()
            closeFilters()
            handleSearch(event)
          }}
          className="flex h-12 min-w-0 flex-1 items-center overflow-visible rounded-full border border-white/15 bg-white/10 shadow-sm backdrop-blur transition-all duration-500 ease-out focus-within:border-gold/35 focus-within:bg-white/[0.13]"
        >
          <div
            className={`grid min-w-0 flex-1 items-center transition-[grid-template-columns] duration-300 ease-out ${
              shouldShowExtraFields
                ? 'grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
                : 'grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_0fr_0fr]'
            }`}
          >
            <SearchInput
              query={query}
              setQuery={setQuery}
              onFocus={() => setSearchExpanded(true)}
            />

            <div
              className={`hidden min-w-0 overflow-visible transition-all duration-300 ease-out lg:block ${
                shouldShowExtraFields
                  ? 'translate-x-0 border-l border-white/15 pl-1 opacity-100 delay-75'
                  : 'pointer-events-none -translate-x-5 opacity-0'
              }`}
            >
              <BoatTypeField
                value={boatType}
                onChange={setBoatType}
                onFocus={() => setSearchExpanded(true)}
              />
            </div>

            <div
              className={`hidden min-w-0 overflow-visible transition-all duration-300 ease-out lg:block ${
                shouldShowExtraFields
                  ? 'translate-x-0 border-l border-white/15 pl-1 opacity-100 delay-150'
                  : 'pointer-events-none -translate-x-5 opacity-0'
              }`}
            >
              <DateRangeField
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                isOpen={datesOpen}
                onToggle={() => {
                  closeFilters()
                  setDatesOpen((current) => !current)
                }}
                onClose={closeDates}
                onFocus={() => setSearchExpanded(true)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="h-full shrink-0 rounded-full bg-gold px-7 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
          >
            Search
          </button>
        </form>

        <FilterToggleButton
          filtersOpen={filtersOpen}
          shouldShow={shouldShowFilterButton}
          onClick={() => {
            closeDates()
            toggleFilters()
          }}
        />
      </div>

      <div
        className={`absolute right-0 top-[calc(100%+0.8rem)] z-[2500] w-[min(40rem,calc(100vw-2rem))] origin-top-right transform-gpu transition-all duration-300 ease-out ${
          filtersOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-4 scale-95 opacity-0'
        }`}
        aria-hidden={!filtersOpen}
      >
        {children}
      </div>
    </div>
  )
}
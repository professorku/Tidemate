import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { BOAT_TYPE_OPTIONS } from '../../addBoat/constants'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function parseDateValue(value) {
  if (!value) return null

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

function formatDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatShortDate(value) {
  const date = parseDateValue(value)

  if (!date) return ''

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function formatDateRangeLabel(startDate, endDate) {
  if (startDate && endDate) {
    return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
  }

  if (startDate) {
    return `From ${formatShortDate(startDate)}`
  }

  if (endDate) {
    return `Until ${formatShortDate(endDate)}`
  }

  return 'Choose dates'
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function getCalendarDays(monthDate) {
  const firstDayOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1
  )

  const mondayBasedStartDay = (firstDayOfMonth.getDay() + 6) % 7
  const calendarStart = new Date(firstDayOfMonth)

  calendarStart.setDate(firstDayOfMonth.getDate() - mondayBasedStartDay)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart)
    date.setDate(calendarStart.getDate() + index)
    return date
  })
}

function isDateWithinRange(dateValue, startDate, endDate) {
  if (!startDate || !endDate) return false
  return dateValue > startDate && dateValue < endDate
}

function BoatTypeField({ value, onChange, onFocus }) {
  return (
    <div className="relative flex h-10 min-w-0 items-center gap-2 rounded-full px-3 transition hover:bg-white/10">
      <LifebuoyIcon className="h-4 w-4 shrink-0 text-gold" />

      <label htmlFor="navbar-boat-type" className="sr-only">
        Boat type
      </label>

      <select
        id="navbar-boat-type"
        value={value}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 appearance-none bg-transparent pr-6 text-sm font-bold text-white outline-none"
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

      <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-white/60" />
    </div>
  )
}

function DateRangeField({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isOpen,
  onToggle,
  onClose,
  onFocus,
}) {
  const initialMonth = parseDateValue(startDate) || new Date()

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  )

  useEffect(() => {
    const nextDate = parseDateValue(startDate) || new Date()
    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
  }, [startDate])

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth]
  )

  const handleSelectDate = (dateValue) => {
    onFocus()

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateValue)
      setEndDate('')
      return
    }

    if (dateValue < startDate) {
      setStartDate(dateValue)
      return
    }

    setEndDate(dateValue)
  }

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => {
          onFocus()
          onToggle()
        }}
        className={`inline-flex h-10 w-full items-center justify-between gap-2 rounded-full px-3 text-left text-sm font-bold text-white transition ${
          isOpen
            ? 'bg-white/10 shadow-sm ring-1 ring-white/10'
            : 'hover:bg-white/10'
        }`}
        aria-expanded={isOpen}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gold" />
          <span className="truncate">
            {formatDateRangeLabel(startDate, endDate)}
          </span>
        </span>

        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-white/60 transition ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`absolute left-1/2 top-[calc(100%+0.7rem)] z-[2800] w-[22rem] -translate-x-1/2 transform-gpu rounded-[26px] border border-gold/25 bg-navy p-4 text-white shadow-2xl ring-1 ring-black/20 transition-all duration-300 ease-out ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-3 scale-95 opacity-0'
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setVisibleMonth((date) => addMonths(date, -1))}
            className="rounded-full border border-white/15 bg-[#071d32] p-2 text-white transition hover:border-gold/50 hover:text-gold"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
              Choose dates
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-white">
              {getMonthLabel(visibleMonth)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setVisibleMonth((date) => addMonths(date, 1))}
            className="rounded-full border border-white/15 bg-[#071d32] p-2 text-white transition hover:border-gold/50 hover:text-gold"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/20 bg-transparent px-3 py-2">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-gold">
              Start
            </p>
            <p className="mt-1 text-sm font-bold text-white">
              {startDate ? formatShortDate(startDate) : 'Select start date'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-transparent px-3 py-2">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-gold">
              End
            </p>
            <p className="mt-1 text-sm font-bold text-white">
              {endDate ? formatShortDate(endDate) : 'Select end date'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="pb-2 text-[0.65rem] font-extrabold uppercase tracking-wide text-white/45"
            >
              {weekday}
            </div>
          ))}

          {calendarDays.map((date) => {
            const dateValue = formatDateValue(date)
            const isCurrentMonth = date.getMonth() === visibleMonth.getMonth()
            const isStart = dateValue === startDate
            const isEnd = dateValue === endDate
            const isSelected = isStart || isEnd
            const isInRange = isDateWithinRange(dateValue, startDate, endDate)
            const isToday = dateValue === formatDateValue(new Date())

            return (
              <button
                key={dateValue}
                type="button"
                onClick={() => handleSelectDate(dateValue)}
                className={`aspect-square rounded-2xl text-sm font-bold transition ${
                  isSelected
                    ? 'bg-gold text-navy shadow-sm ring-1 ring-gold/40'
                    : isInRange
                      ? 'bg-gold/15 text-gold'
                      : isToday
                        ? 'border border-gold/40 bg-gold/10 text-gold hover:bg-gold hover:text-navy'
                        : isCurrentMonth
                          ? 'text-white hover:bg-white/10 hover:text-gold'
                          : 'text-white/25 hover:bg-white/5 hover:text-white/60'
                }`}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="flex-1 rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-gold px-3 py-2 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

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

  const shouldShowFilterButton = hasMarketplaceSearch || filtersOpen

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
          className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-sm backdrop-blur transition-all duration-500 ease-out focus-within:border-gold/35 focus-within:bg-white/[0.13]"
        >
          <div
            className={`grid min-w-0 flex-1 items-center transition-[grid-template-columns] duration-300 ease-out ${
              shouldShowExtraFields
                ? 'grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
                : 'grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_0fr_0fr]'
            }`}
          >
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-full px-3 transition focus-within:bg-white/10">
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-gold" />
              <span className="sr-only">Where are you going?</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/65"
                placeholder="Where are you going?"
                value={query}
                onFocus={() => setSearchExpanded(true)}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

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

        <div
          className={`shrink-0 overflow-hidden transition-all duration-500 ease-out ${
            shouldShowFilterButton
              ? 'max-w-[8.25rem] translate-x-0 opacity-100'
              : 'pointer-events-none max-w-0 translate-x-4 opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              closeDates()
              toggleFilters()
            }}
            className={`flex h-12 min-w-0 items-center gap-1.5 rounded-full border border-transparent bg-transparent px-4 text-sm font-bold text-white shadow-none backdrop-blur transition-all duration-300 ease-out ${
              filtersOpen
                ? 'bg-white/10'
                : 'hover:bg-white/10'
            }`}
            aria-expanded={filtersOpen}
            tabIndex={shouldShowFilterButton ? 0 : -1}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-white" />
            Filters
          </button>
        </div>
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
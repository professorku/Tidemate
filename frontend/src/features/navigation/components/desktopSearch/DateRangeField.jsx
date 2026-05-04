import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import {
  WEEKDAYS,
  addMonths,
  formatDateRangeLabel,
  formatDateValue,
  formatShortDate,
  getCalendarDays,
  getMonthLabel,
  isDateWithinRange,
  parseDateValue,
} from './dateUtils'

export default function DateRangeField({
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
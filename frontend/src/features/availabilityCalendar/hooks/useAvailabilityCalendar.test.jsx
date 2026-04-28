import { useMemo, useState } from 'react'
import {
  parseISODate,
  normalizeDate,
  addMonths,
  isWithinRange,
} from '../utils/availabilityCalendarUtils'

export function useAvailabilityCalendar({
  blockedRanges,
  selectedStartDate,
  selectedEndDate,
  monthsToShow,
}) {
  const today = useMemo(() => normalizeDate(new Date()), [])

  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const safeRanges = useMemo(() => {
    if (!Array.isArray(blockedRanges)) return []

    return blockedRanges
      .map((range) => {
        const start = parseISODate(range?.start_date)
        const end = parseISODate(range?.end_date)
        if (!start || !end) return null

        return {
          start,
          end,
          start_date: range.start_date,
          end_date: range.end_date,
        }
      })
      .filter(Boolean)
  }, [blockedRanges])

  const selectedStart = selectedStartDate
    ? parseISODate(selectedStartDate)
    : null

  const selectedEnd = selectedEndDate ? parseISODate(selectedEndDate) : null

  const visibleMonths = useMemo(() => {
    return Array.from({ length: monthsToShow }, (_, index) =>
      addMonths(viewDate, index)
    )
  }, [viewDate, monthsToShow])

  const canGoPrev = viewDate > new Date(today.getFullYear(), today.getMonth(), 1)

  const isBlocked = (date) =>
    safeRanges.some((range) => isWithinRange(date, range.start, range.end))

  return {
    today,
    viewDate,
    setViewDate,
    safeRanges,
    visibleMonths,
    selectedStart,
    selectedEnd,
    isBlocked,
    canGoPrev,
  }
}
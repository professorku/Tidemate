export const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function parseDateValue(value) {
  if (!value || typeof value !== 'string') return null

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function formatDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getTodayDateValue() {
  return formatDateValue(new Date())
}

export function formatShortDate(value) {
  const date = parseDateValue(value)

  if (!date) return ''

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatDateRangeLabel(startDate, endDate) {
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

export function getMonthLabel(date) {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getCurrentMonthStart() {
  return getMonthStart(new Date())
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function clampMonthToCurrentMonth(date) {
  const monthStart = getMonthStart(date || new Date())
  const currentMonthStart = getCurrentMonthStart()

  if (monthStart < currentMonthStart) {
    return currentMonthStart
  }

  return monthStart
}

export function isMonthSameOrBeforeCurrentMonth(date) {
  return getMonthStart(date).getTime() <= getCurrentMonthStart().getTime()
}

export function getCalendarDays(monthDate) {
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

export function isDateBeforeToday(dateValue) {
  const date = parseDateValue(dateValue)

  if (!date) return false

  return formatDateValue(date) < getTodayDateValue()
}

export function isDateWithinRange(dateValue, startDate, endDate) {
  if (!startDate || !endDate) return false
  return dateValue > startDate && dateValue < endDate
}
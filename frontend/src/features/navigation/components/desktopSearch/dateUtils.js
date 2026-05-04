export const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function parseDateValue(value) {
  if (!value) return null

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

export function formatDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
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

export function isDateWithinRange(dateValue, startDate, endDate) {
  if (!startDate || !endDate) return false
  return dateValue > startDate && dateValue < endDate
}
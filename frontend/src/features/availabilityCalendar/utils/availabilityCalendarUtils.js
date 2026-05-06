export function parseISODate(value) {
  if (!value || typeof value !== 'string') return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function normalizeDate(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatISODate(date) {
  const d = normalizeDate(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function monthLabel(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = lastDayOfMonth.getDate()

  const cells = []

  for (let i = 0; i < startWeekday; i++) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  return normalizeDate(a).getTime() === normalizeDate(b).getTime()
}

// Inclusive range.
// Used for selected date ranges in the calendar UI.
// Example: selecting May 1 -> May 5 should visually include May 5.
export function isWithinRange(date, start, end) {
  if (!date || !start || !end) return false

  const current = normalizeDate(date).getTime()
  const startTime = normalizeDate(start).getTime()
  const endTime = normalizeDate(end).getTime()

  return current >= startTime && current <= endTime
}

// Half-open range.
// Used for unavailable booking ranges.
// Example: booking May 1 -> May 5 blocks May 1, 2, 3, 4,
// but May 5 is available again as the return/startover date.
export function isWithinHalfOpenRange(date, start, end) {
  if (!date || !start || !end) return false

  const current = normalizeDate(date).getTime()
  const startTime = normalizeDate(start).getTime()
  const endTime = normalizeDate(end).getTime()

  return current >= startTime && current < endTime
}

export function isPastDate(date) {
  const today = normalizeDate(new Date())
  return normalizeDate(date) < today
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}
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

export function formatHumanDate(value) {
  const date = parseISODate(value)
  if (!date) return 'Select date'
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateWithTime(value, timeLabel) {
  const date = parseISODate(value)
  if (!date) return 'Select date'

  return `${date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} at ${timeLabel}`
}

export function daysBetweenInclusive(start, end) {
  const diff = normalizeDate(end).getTime() - normalizeDate(start).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
}

export function rangeOverlaps(startA, endA, startB, endB) {
  return (
    normalizeDate(startA) <= normalizeDate(endB) &&
    normalizeDate(endA) >= normalizeDate(startB)
  )
}
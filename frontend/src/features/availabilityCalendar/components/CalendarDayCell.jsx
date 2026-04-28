import {
  formatISODate,
  isPastDate,
  isSameDay,
  isWithinRange,
} from '../utils/availabilityCalendarUtils'

export default function CalendarDayCell({
  date,
  today,
  selectedStart,
  selectedEnd,
  interactive,
  onDateClick,
  isBlocked,
}) {
  if (!date) {
    return <div className="aspect-square" />
  }

  const blocked = isBlocked(date)
  const past = isPastDate(date)
  const disabled = blocked || past

  const isStart = selectedStart && isSameDay(date, selectedStart)
  const isEnd = selectedEnd && isSameDay(date, selectedEnd)

  const inSelectedRange =
    selectedStart &&
    selectedEnd &&
    isWithinRange(date, selectedStart, selectedEnd) &&
    !isStart &&
    !isEnd

  const isToday = isSameDay(date, today)

  let className =
    'relative flex aspect-square items-center justify-center rounded-2xl text-sm font-semibold '

  if (isStart || isEnd) className += 'bg-navy text-white'
  else if (inSelectedRange) className += 'bg-navy/10 text-navy'
  else if (blocked) className += 'bg-slate-400 text-white'
  else if (disabled) className += 'bg-slate-100 text-slate-400'
  else if (interactive) className += 'bg-white ring-1 ring-slate-200 hover:bg-slate-50'
  else className += 'bg-white ring-1 ring-slate-200'

  return (
    <button
      type="button"
      disabled={!interactive || disabled}
      onClick={() => onDateClick?.(formatISODate(date))}
      className={className}
    >
      {isToday && !(isStart || isEnd) && (
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-navy" />
      )}
      {date.getDate()}
    </button>
  )
}
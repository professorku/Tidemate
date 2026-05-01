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
    'relative flex aspect-square items-center justify-center rounded-2xl text-sm font-semibold transition '

  if (isStart || isEnd) className += 'bg-gold text-navy'
  else if (inSelectedRange) className += 'bg-gold/15 text-gold'
  else if (blocked) className += 'bg-white/30 text-white/80'
  else if (disabled) className += 'bg-white/10 text-white/30'
  else if (interactive) className += 'bg-[#071d32] text-white ring-1 ring-gold/20 hover:bg-white/10'
  else className += 'bg-[#071d32] text-white ring-1 ring-gold/20'

  return (
    <button
      type="button"
      disabled={!interactive || disabled}
      onClick={() => onDateClick?.(formatISODate(date))}
      className={className}
    >
      {isToday && !(isStart || isEnd) && (
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
      )}
      {date.getDate()}
    </button>
  )
}
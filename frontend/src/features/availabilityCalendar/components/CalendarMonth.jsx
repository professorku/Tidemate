import { buildCalendarDays, monthLabel } from '../utils/availabilityCalendarUtils'
import CalendarDayCell from './CalendarDayCell'

export default function CalendarMonth(props) {
  const { monthDate } = props
  const days = buildCalendarDays(monthDate)

  return (
    <div className="overflow-hidden rounded-[24px] border border-gold/20">
      <div className="border-b border-gold/15 bg-navy px-4 py-4 text-center font-semibold text-white">
        {monthLabel(monthDate)}
      </div>

      <div className="grid grid-cols-7 border-b border-gold/10 px-2 py-3 text-center text-xs font-semibold text-white/55">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      <div className="grid grid-cols-7 gap-2 p-3">
        {days.map((date, index) => (
          <CalendarDayCell key={index} date={date} {...props} />
        ))}
      </div>
    </div>
  )
}
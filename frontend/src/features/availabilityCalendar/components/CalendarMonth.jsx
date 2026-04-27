import { buildCalendarDays, monthLabel } from '../utils/availabilityCalendarUtils'
import CalendarDayCell from './CalendarDayCell'

export default function CalendarMonth(props) {
  const { monthDate } = props
  const days = buildCalendarDays(monthDate)

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 text-center font-semibold">
        {monthLabel(monthDate)}
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 px-2 py-3 text-center text-xs font-semibold text-slate-500">
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
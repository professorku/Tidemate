import CalendarLegend from './CalendarLegend'
import CalendarMonth from './CalendarMonth'
import CalendarUnavailableRanges from './CalendarUnavailableRanges'
import { useAvailabilityCalendar } from '../hooks/useAvailabilityCalendar'
import { addMonths } from '../utils/availabilityCalendarUtils'

export default function AvailabilityCalendar(props) {
  const {
    onDateClick,
    monthsToShow = 2,
    interactive = false,
    title = 'Availability',
    subtitle = '',
  } = props

  const {
    today,
    viewDate,
    setViewDate,
    safeRanges,
    visibleMonths,
    selectedStart,
    selectedEnd,
    isBlocked,
    getStatus,
    canGoPrev,
  } = useAvailabilityCalendar(props)

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!canGoPrev}
            onClick={() => setViewDate(addMonths(viewDate, -1))}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            ←
          </button>

          <button
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            →
          </button>
        </div>
      </div>

      <CalendarLegend />

      <div className={`mt-6 grid gap-6 ${monthsToShow > 1 ? 'xl:grid-cols-2' : ''}`}>
        {visibleMonths.map((monthDate) => (
          <CalendarMonth
            key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
            monthDate={monthDate}
            today={today}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            interactive={interactive}
            onDateClick={onDateClick}
            isBlocked={isBlocked}
            getStatus={getStatus}
          />
        ))}
      </div>

      <CalendarUnavailableRanges ranges={safeRanges} />
    </div>
  )
}
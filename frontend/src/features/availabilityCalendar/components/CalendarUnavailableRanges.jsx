export default function CalendarUnavailableRanges({ ranges = [] }) {
  if (!ranges.length) return null

  return (
    <div className="mt-6 rounded-[24px] bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-800">
        Upcoming unavailable dates
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {ranges.slice(0, 8).map((range, index) => (
          <span
            key={`${range.start_date}-${range.end_date}-${index}`}
            className="rounded-full bg-slate-400 px-3 py-1.5 text-xs font-semibold text-white"
          >
            {range.start_date} → {range.end_date}
          </span>
        ))}
      </div>
    </div>
  )
}
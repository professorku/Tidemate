export default function CalendarUnavailableRanges({ ranges = [] }) {
  if (!ranges.length) return null

  return (
    <div className="mt-6 rounded-[24px] border border-gold/15 bg-navy p-4">
      <p className="text-sm font-semibold text-white">
        Upcoming unavailable dates
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {ranges.slice(0, 8).map((range, index) => (
          <span
            key={`${range.start_date}-${range.end_date}-${index}`}
            className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white"
          >
            {range.start_date} → {range.end_date}
          </span>
        ))}
      </div>
    </div>
  )
}
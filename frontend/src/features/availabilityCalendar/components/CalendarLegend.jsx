export default function CalendarLegend() {
  return (
    <div className="mt-5 flex flex-wrap gap-3 text-sm">
      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700">
        <span className="h-3 w-3 rounded-full bg-white ring-1 ring-slate-300" />
        Available
      </div>

      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700">
        <span className="h-3 w-3 rounded-full bg-slate-400" />
        Unavailable
      </div>

      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700">
        <span className="h-3 w-3 rounded-full bg-navy" />
        Your selection
      </div>
    </div>
  )
}
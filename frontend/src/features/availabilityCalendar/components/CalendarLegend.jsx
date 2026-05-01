export default function CalendarLegend() {
  return (
    <div className="mt-5 flex flex-wrap gap-3 text-sm">
      <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white/75">
        <span className="h-3 w-3 rounded-full bg-[#071d32] ring-1 ring-gold/30" />
        Available
      </div>

      <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white/75">
        <span className="h-3 w-3 rounded-full bg-white/35" />
        Unavailable
      </div>

      <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white/75">
        <span className="h-3 w-3 rounded-full bg-gold" />
        Your selection
      </div>
    </div>
  )
}
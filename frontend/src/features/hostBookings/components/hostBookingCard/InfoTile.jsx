export default function InfoTile({ icon, label, value, subtext }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
          {icon}
        </div>

        <p className="text-[11px] font-extrabold uppercase tracking-wide text-gold">
          {label}
        </p>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-white">{value}</p>

      {subtext ? (
        <p className="mt-1 text-[11px] font-medium text-white/55">{subtext}</p>
      ) : null}
    </div>
  )
}
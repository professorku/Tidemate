export default function ModerationStatCard({ label, value, icon }) {
  return (
    <div className="rounded-[24px] border border-gold/20 bg-navy p-5 text-white shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black">
            {value ?? 0}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/20">
          {icon}
        </div>
      </div>
    </div>
  )
}
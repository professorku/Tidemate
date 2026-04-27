import SectionShell from '../../../components/ui/SectionShell'
import SectionHeader from '../../../components/ui/SectionHeader'

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  )
}

export default function HostBookingsHero({ stats = {} }) {
  return (
    <SectionShell padding="hero">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title="Host bookings"
          description="Manage booking requests, confirmed trips, active rentals, and cancellations for boats you host."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <HeroStat label="Total" value={stats.all ?? 0} />
          <HeroStat label="Pending" value={stats.pending ?? 0} />
          <HeroStat label="Confirmed" value={stats.confirmed ?? 0} />
        </div>
      </div>
    </SectionShell>
  )
}

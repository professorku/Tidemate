import { CalendarDaysIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

function PublicStatCard({ icon, label, value, text }) {
  return (
    <article className="rounded-[28px] border border-white/15 bg-navy p-5 text-white shadow-soft transition hover:-translate-y-0.5 hover:border-gold/30 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
            {label}
          </p>

          <p className="mt-2 text-xl font-black tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-sm leading-6 text-white/65">
            {text}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function PublicProfileStats({ joinedText, reviewCount, averageRating, boatCount }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <PublicStatCard
        icon={<CalendarDaysIcon className="h-6 w-6" />}
        label="Member since"
        value={joinedText}
        text="When this host joined TideMate"
      />

      <PublicStatCard
        icon={<StarIcon className="h-6 w-6" />}
        label="Reviews"
        value={reviewCount > 0 ? `${Number(averageRating).toFixed(1)} / 5` : 'No reviews yet'}
        text={`${reviewCount} total review${reviewCount === 1 ? '' : 's'}`}
      />

      <PublicStatCard
        icon={<UserGroupIcon className="h-6 w-6" />}
        label="Boats listed"
        value={`${boatCount} boat${boatCount === 1 ? '' : 's'}`}
        text="Public boats currently available"
      />
    </div>
  )
}
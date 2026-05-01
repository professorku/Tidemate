import {
  LifebuoyIcon,
  PhotoIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

function Metric({ icon, label, value, tone = 'default' }) {
  const toneClass =
    tone === 'warning'
      ? 'border-red-300/25 bg-red-400/10 text-red-200'
      : 'border-gold/15 bg-[#071d32]/70 text-white'

  return (
    <div className={`rounded-[22px] border px-4 py-3 shadow-sm ${toneClass}`}>
      <div className="flex items-center gap-2 text-gold">
        {icon}
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  )
}

export default function EditBoatHero({
  boat,
  existingImagesCount = 0,
  newImagesCount = 0,
  removedImagesCount = 0,
}) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-gold/20 bg-navy shadow-soft">
      <div className="relative border-b border-gold/10 px-6 py-8 md:px-8 md:py-10">
        <div className="absolute right-8 top-8 hidden rounded-full bg-[#071d32]/80 p-5 text-gold shadow-sm ring-1 ring-gold/20 md:block">
          <LifebuoyIcon className="h-10 w-10" />
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Edit boat
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
            Update details, gallery, cover photo, exact private pickup point, and
            renter-facing information for{' '}
            <span className="font-bold text-gold">
              {boat?.title || 'this listing'}
            </span>
            .
          </p>
        </div>
      </div>

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-3 md:px-8">
        <Metric
          icon={<PhotoIcon className="h-4 w-4" />}
          label="Current photos"
          value={existingImagesCount}
        />

        <Metric
          icon={<SparklesIcon className="h-4 w-4" />}
          label="New uploads"
          value={newImagesCount}
        />

        <Metric
          icon={<TrashIcon className="h-4 w-4" />}
          label="Marked remove"
          value={removedImagesCount}
          tone={removedImagesCount > 0 ? 'warning' : 'default'}
        />
      </div>
    </section>
  )
}
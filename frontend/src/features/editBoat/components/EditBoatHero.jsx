import {
  LifebuoyIcon,
  PhotoIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

function Metric({ icon, label, value, tone = 'default' }) {
  const toneClass =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-slate-200 bg-white text-slate-900'

  return (
    <div className={`rounded-[22px] border px-4 py-3 shadow-sm ${toneClass}`}>
      <div className="flex items-center gap-2 text-slate-500">
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
    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
      <div className="relative border-b border-slate-100 bg-gradient-to-br from-white via-sky-50 to-white px-6 py-8 md:px-8 md:py-10">
        <div className="absolute right-8 top-8 hidden rounded-full bg-white p-5 text-navy shadow-sm ring-1 ring-slate-200 md:block">
          <LifebuoyIcon className="h-10 w-10" />
        </div>

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-gold" />
            Listing editor
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Edit boat
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Update details, gallery, cover photo, exact private pickup point, and
            renter-facing information for{' '}
            <span className="font-bold text-slate-900">
              {boat?.title || 'this listing'}
            </span>
            .
          </p>
        </div>
      </div>

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-3 md:px-8">
        <Metric
          icon={<PhotoIcon className="h-4 w-4 text-navy" />}
          label="Current photos"
          value={existingImagesCount}
        />

        <Metric
          icon={<SparklesIcon className="h-4 w-4 text-navy" />}
          label="New uploads"
          value={newImagesCount}
        />

        <Metric
          icon={<TrashIcon className="h-4 w-4 text-amber-700" />}
          label="Marked remove"
          value={removedImagesCount}
          tone={removedImagesCount > 0 ? 'warning' : 'default'}
        />
      </div>
    </section>
  )
}
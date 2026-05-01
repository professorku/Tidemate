import { StarIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function NewUploadCard({
  item,
  index,
  isCover,
  onSetCover,
  onRemove,
  disabled = false,
}) {
  return (
    <article
      className={`overflow-hidden rounded-[26px] border bg-white shadow-sm ${
        isCover ? 'border-gold ring-2 ring-gold/30' : 'border-slate-200'
      }`}
    >
      <div className="relative h-48 bg-slate-100">
        <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />

        {isCover ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-navy shadow-sm">
            <StarIcon className="h-4 w-4" />
            Cover
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="truncate text-sm font-bold text-slate-900">
            {item.file.name}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            New upload #{index + 1}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSetCover}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isCover
                ? 'bg-gold text-navy'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <StarIcon className="h-4 w-4" />
            {isCover ? 'Cover photo' : 'Set cover'}
          </button>

          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}
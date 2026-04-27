import { StarIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ExistingImageCard({ image, isCover, onSetCover, onRemove }) {
  return (
    <div
      className={`overflow-hidden rounded-[24px] border ${
        isCover ? 'border-gold ring-2 ring-gold/30' : 'border-slate-200'
      }`}
    >
      <img src={image.image} alt="Boat" className="h-44 w-full object-cover" />

      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSetCover}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              isCover ? 'bg-gold text-navy' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <StarIcon className="h-4 w-4" />
            {isCover ? 'Cover photo' : 'Set as cover'}
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

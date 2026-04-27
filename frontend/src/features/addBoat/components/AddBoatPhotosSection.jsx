import { PhotoIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function AddBoatPhotosSection({
  previews,
  coverIndex,
  onImagesChange,
  onSetCoverIndex,
  onRemoveImage,
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft md:p-8">
      <h2 className="text-2xl font-bold text-slate-900">Photos</h2>
      <p className="mt-2 text-slate-600">
        Upload several images and choose the one that should be the cover.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Upload photos
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onImagesChange}
          className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
        />
      </div>

      {previews.length === 0 ? (
        <div className="mt-6 rounded-[24px] bg-slate-50 p-8 text-center text-slate-500">
          <PhotoIcon className="mx-auto h-10 w-10" />
          <p className="mt-3">No photos selected yet</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {previews.map((item, index) => {
            const isCover = index === coverIndex

            return (
              <div
                key={`${item.file.name}-${index}`}
                className={`overflow-hidden rounded-[24px] border ${
                  isCover ? 'border-gold ring-2 ring-gold/30' : 'border-slate-200'
                }`}
              >
                <img
                  src={item.url}
                  alt={item.file.name}
                  className="h-44 w-full object-cover"
                />

                <div className="space-y-3 p-4">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {item.file.name}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSetCoverIndex(index)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                        isCover ? 'bg-gold text-navy' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <StarIcon className="h-4 w-4" />
                      {isCover ? 'Cover photo' : 'Set as cover'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
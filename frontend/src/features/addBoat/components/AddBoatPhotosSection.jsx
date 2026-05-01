import {
  ArrowUpTrayIcon,
  PhotoIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

function EmptyPhotosState({ disabled, onImagesChange }) {
  return (
    <label className="mt-6 block cursor-pointer rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-gold hover:bg-amber-50/40">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-navy shadow-sm ring-1 ring-slate-200">
        <PhotoIcon className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-lg font-extrabold text-slate-900">
        Upload listing photos
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Add at least one clear photo. Multiple angles make the listing feel more
        trustworthy.
      </p>

      <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-extrabold text-white">
        <ArrowUpTrayIcon className="h-5 w-5" />
        Choose photos
      </span>

      <input
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={onImagesChange}
        className="hidden"
      />
    </label>
  )
}

export default function AddBoatPhotosSection({
  previews,
  coverIndex,
  onImagesChange,
  onSetCoverIndex,
  onRemoveImage,
  disabled = false,
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy">
            <PhotoIcon className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
              Gallery
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              Photos
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Upload several images and choose the cover photo renters see first.
            </p>
          </div>
        </div>

        {previews.length > 0 ? (
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Add more photos
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={disabled}
              onChange={onImagesChange}
              className="hidden"
            />
          </label>
        ) : null}
      </div>

      {previews.length === 0 ? (
        <EmptyPhotosState disabled={disabled} onImagesChange={onImagesChange} />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {previews.map((item, index) => {
            const isCover = index === coverIndex

            return (
              <article
                key={`${item.file.name}-${index}`}
                className={`overflow-hidden rounded-[26px] border bg-white shadow-sm ${
                  isCover
                    ? 'border-gold ring-2 ring-gold/30'
                    : 'border-slate-200'
                }`}
              >
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={item.url}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />

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
                      onClick={() => onSetCoverIndex(index)}
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
                      onClick={() => onRemoveImage(index)}
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
          })}
        </div>
      )}
    </section>
  )
}
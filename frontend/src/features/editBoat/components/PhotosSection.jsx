import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline'
import ExistingImageCard from './ExistingImageCard'
import NewUploadCard from './NewUploadCard'

export default function PhotosSection({
  existingImages,
  newPreviews,
  coverSelection,
  onFileChange,
  onSetExistingCover,
  onSetNewCover,
  onRemoveExisting,
  onRemoveNew,
  disabled = false,
}) {
  const hasImages = existingImages.length > 0 || newPreviews.length > 0

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
              Manage the current gallery, add new uploads, and choose the cover photo.
            </p>
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
          <ArrowUpTrayIcon className="h-5 w-5" />
          Upload photos
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={disabled}
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      </div>

      {!hasImages ? (
        <div className="mt-6 rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-navy shadow-sm ring-1 ring-slate-200">
            <PhotoIcon className="h-8 w-8" />
          </div>

          <h3 className="mt-4 text-lg font-extrabold text-slate-900">
            No photos on this listing
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Upload at least one photo before saving the listing.
          </p>
        </div>
      ) : null}

      {existingImages.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-lg font-extrabold text-slate-900">
            Current gallery
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            These photos are already saved on the listing.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {existingImages.map((image) => (
              <ExistingImageCard
                key={image.id}
                image={image}
                isCover={
                  coverSelection?.type === 'existing' &&
                  Number(coverSelection.id) === Number(image.id)
                }
                onSetCover={() => onSetExistingCover(image.id)}
                onRemove={() => onRemoveExisting(image.id)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ) : null}

      {newPreviews.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-lg font-extrabold text-slate-900">New uploads</h3>
          <p className="mt-1 text-sm text-slate-500">
            These photos will be uploaded when you save changes.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {newPreviews.map((item, index) => (
              <NewUploadCard
                key={`${item.file.name}-${index}`}
                item={item}
                index={index}
                isCover={
                  coverSelection?.type === 'new' &&
                  Number(coverSelection.index) === Number(index)
                }
                onSetCover={() => onSetNewCover(index)}
                onRemove={onRemoveNew}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
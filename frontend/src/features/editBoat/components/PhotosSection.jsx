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
    <section className="rounded-[30px] border border-gold/20 bg-navy p-5 shadow-soft md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
            <PhotoIcon className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Gallery
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white">
              Photos
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Manage the current gallery, add new uploads, and choose the cover photo.
            </p>
          </div>
        </div>

        <label className="inline-flex w-fit shrink-0 cursor-pointer items-center justify-center gap-2 self-start whitespace-nowrap rounded-full border border-gold/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-white/15">
          <ArrowUpTrayIcon className="h-5 w-5 shrink-0 text-gold" />
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
        <div className="mt-6 rounded-[28px] border-2 border-dashed border-gold/25 bg-[#071d32]/60 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-gold shadow-sm ring-1 ring-gold/20">
            <PhotoIcon className="h-8 w-8" />
          </div>

          <h3 className="mt-4 text-lg font-extrabold text-white">
            No photos on this listing
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">
            Upload at least one photo before saving the listing.
          </p>
        </div>
      ) : null}

      {existingImages.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-lg font-extrabold text-white">
            Current gallery
          </h3>
          <p className="mt-1 text-sm text-white/55">
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
          <h3 className="text-lg font-extrabold text-white">New uploads</h3>
          <p className="mt-1 text-sm text-white/55">
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
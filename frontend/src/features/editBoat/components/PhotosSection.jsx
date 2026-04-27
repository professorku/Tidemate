import { PhotoIcon } from '@heroicons/react/24/outline'
import ExistingImageCard from './ExistingImageCard'
import NewUploadCard from './NewUploadCard'

export default function PhotosSection({
  existingImages,
  newPreviews,
  coverImageId,
  onFileChange,
  onSetCover,
  onRemoveExisting,
  onRemoveNew,
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft md:p-8">
      <h2 className="text-2xl font-bold text-slate-900">Photos</h2>
      <p className="mt-2 text-slate-600">
        Choose which image should represent your listing best.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Upload more photos
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onFileChange}
          className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-900">Current gallery</h3>

        {existingImages.length === 0 ? (
          <div className="mt-4 rounded-[24px] bg-slate-50 p-8 text-center text-slate-500">
            <PhotoIcon className="mx-auto h-10 w-10" />
            <p className="mt-3">No current images</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {existingImages.map((image) => (
              <ExistingImageCard
                key={image.id}
                image={image}
                isCover={coverImageId === image.id}
                onSetCover={() => onSetCover(image.id)}
                onRemove={() => onRemoveExisting(image.id)}
              />
            ))}
          </div>
        )}
      </div>

      {newPreviews.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900">New uploads</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {newPreviews.map((item, index) => (
              <NewUploadCard
                key={`${item.file.name}-${index}`}
                item={item}
                index={index}
                onRemove={onRemoveNew}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Newly uploaded photos will be added to the gallery when you save. You can
            choose one of the existing images as cover now, and set a new upload as
            cover after saving if you want.
          </p>
        </div>
      ) : null}
    </div>
  )
}

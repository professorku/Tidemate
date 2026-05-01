import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhotoIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'

function StatusRow({ complete, label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ${
            complete
              ? 'text-emerald-700 ring-emerald-100'
              : 'text-slate-400 ring-slate-200'
          }`}
        >
          {complete ? <CheckCircleIcon className="h-5 w-5" /> : icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p
            className={`mt-1 break-words text-sm font-semibold ${
              complete ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            {value || 'Not completed yet'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function UpdateListingSidebar({
  locationName,
  pickupAddress,
  latitude,
  longitude,
  existingImagesCount,
  removedImagesCount = 0,
  newImagesCount,
  coverSelection,
  error,
  saving,
}) {
  const hasExactPoint = Boolean(latitude && longitude)
  const hasPublicLocation = Boolean(locationName)
  const hasPrivateLocation = Boolean(pickupAddress)
  const hasPhotos = existingImagesCount + newImagesCount > 0
  const hasCover = Boolean(coverSelection)
  const ready = hasExactPoint && hasPublicLocation && hasPrivateLocation && hasPhotos && hasCover

  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-navy ring-1 ring-amber-100">
          <RocketLaunchIcon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
            Save
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            Update listing
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Save your changes when the listing looks right.
          </p>
        </div>
      </div>

      <div
        className={`mt-5 rounded-[22px] border px-4 py-3 text-sm ${
          ready
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-amber-200 bg-amber-50 text-amber-900'
        }`}
      >
        <div className="flex items-start gap-2">
          {ready ? (
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="leading-6">
            {ready
              ? 'The listing has the required location, photo, and cover information.'
              : 'Make sure location, photos, and cover photo are set before saving.'}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <StatusRow
          complete={hasPublicLocation}
          label="Public area"
          value={locationName || 'Shown to renters before confirmation'}
          icon={<MapPinIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasPrivateLocation && hasExactPoint}
          label="Private pickup point"
          value={
            hasPrivateLocation
              ? `${pickupAddress}${hasExactPoint ? ` · ${latitude}, ${longitude}` : ''}`
              : 'Only confirmed renters can see this'
          }
          icon={<MapPinIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasPhotos}
          label="Photos"
          value={`${existingImagesCount} current · ${newImagesCount} new${
            removedImagesCount ? ` · ${removedImagesCount} removed` : ''
          }`}
          icon={<PhotoIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasCover}
          label="Cover photo"
          value={
            coverSelection?.type === 'existing'
              ? `Existing image #${coverSelection.id}`
              : coverSelection?.type === 'new'
                ? `New upload #${coverSelection.index + 1}`
                : 'Choose one gallery image'
          }
          icon={<PhotoIcon className="h-5 w-5" />}
        />
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-extrabold text-navy shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RocketLaunchIcon className="h-5 w-5" />
        {saving ? 'Saving changes...' : 'Save changes'}
      </button>
    </div>
  )
}
export default function UpdateListingSidebar({
  locationName,
  pickupAddress,
  existingImagesCount,
  newImagesCount,
  error,
  saving,
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft">
      <h2 className="text-2xl font-bold text-slate-900">Update listing</h2>
      <p className="mt-3 text-slate-600">Save your changes when everything looks right.</p>

      <div className="mt-6 space-y-4 rounded-[24px] bg-mist p-5 text-sm">
        <div>
          <p className="text-slate-500">Public location</p>
          <p className="mt-1 font-semibold text-slate-900">
            {locationName || 'Not selected yet'}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Private pickup address</p>
          <p className="mt-1 font-semibold text-slate-900">
            {pickupAddress || 'Not added yet'}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Current images</p>
          <p className="mt-1 font-semibold text-slate-900">{existingImagesCount}</p>
        </div>

        <div>
          <p className="text-slate-500">New uploads</p>
          <p className="mt-1 font-semibold text-slate-900">{newImagesCount}</p>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-navy disabled:opacity-60"
      >
        {saving ? 'Saving changes...' : 'Save changes'}
      </button>
    </div>
  )
}
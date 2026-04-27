export default function AddBoatPublishCard({
  form,
  images,
  coverIndex,
  error,
  loading,
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft">
      <h2 className="text-2xl font-bold text-slate-900">Ready to publish?</h2>
      <p className="mt-3 text-slate-600">
        Review your details and create your boat listing.
      </p>

      <div className="mt-6 space-y-4 rounded-[24px] bg-mist p-5 text-sm">
        <div>
          <p className="text-slate-500">Location</p>
          <p className="mt-1 font-semibold text-slate-900">
            {form.location_name || 'Not selected yet'}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Photos</p>
          <p className="mt-1 font-semibold text-slate-900">
            {images.length} selected
          </p>
        </div>

        {images.length > 0 ? (
          <div>
            <p className="text-slate-500">Cover photo</p>
            <p className="mt-1 font-semibold text-slate-900">
              {images[coverIndex]?.name || 'Not selected'}
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-gold px-6 py-3.5 font-semibold text-navy disabled:opacity-60"
      >
        {loading ? 'Creating listing...' : 'Create listing'}
      </button>
    </div>
  )
}
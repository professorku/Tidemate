export default function SelectedLocationCard({
  locationName,
  latitude,
  longitude,
  reverseLoading,
}) {
  return (
    <div className="rounded-[24px] bg-mist p-5">
      <h3 className="text-lg font-bold text-slate-900">Selected location</h3>

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <p className="text-slate-500">Location name</p>
          <p className="mt-1 font-semibold text-slate-900">
            {locationName || 'No place selected yet'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-slate-500">Latitude</p>
            <p className="mt-1 font-semibold text-slate-900">
              {latitude || '—'}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Longitude</p>
            <p className="mt-1 font-semibold text-slate-900">
              {longitude || '—'}
            </p>
          </div>
        </div>

        {reverseLoading ? (
          <p className="text-slate-500">Updating location details...</p>
        ) : null}
      </div>
    </div>
  )
}
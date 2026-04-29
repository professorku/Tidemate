export default function SelectedLocationCard({
  locationName,
  pickupAddress,
  latitude,
  longitude,
  reverseLoading,
}) {
  const hasExactPoint = Boolean(latitude && longitude)

  return (
    <div className="rounded-[24px] bg-mist p-5">
      <h3 className="text-lg font-bold text-slate-900">Selected location</h3>

      <div className="mt-4 space-y-4 text-sm">
        <div>
          <p className="text-slate-500">City/area shown publicly</p>
          <p className="mt-1 font-semibold text-slate-900">
            {locationName || 'No city or area selected yet'}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Exact private location</p>
          <p className="mt-1 font-semibold text-slate-900">
            {pickupAddress || 'Click the map or choose a search result'}
          </p>

          {hasExactPoint ? (
            <p className="mt-1 text-xs text-slate-500">
              {latitude}, {longitude}
            </p>
          ) : null}
        </div>

        {reverseLoading ? (
          <p className="text-slate-500">Updating exact location...</p>
        ) : null}
      </div>
    </div>
  )
}
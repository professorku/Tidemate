export default function SelectedLocationCard({
  locationName,
  pickupAddress,
  latitude,
  longitude,
  reverseLoading,
}) {
  const hasExactPoint = Boolean(latitude && longitude)

  return (
    <div className="rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-5">
      <h3 className="text-lg font-bold text-white">Selected location</h3>

      <div className="mt-4 space-y-4 text-sm">
        <div>
          <p className="text-white/50">City/area shown publicly</p>
          <p className="mt-1 font-semibold text-white">
            {locationName || 'No city or area selected yet'}
          </p>
        </div>

        <div>
          <p className="text-white/50">Exact private location</p>
          <p className="mt-1 font-semibold text-white">
            {pickupAddress || 'Click the map or choose a search result'}
          </p>

          {hasExactPoint ? (
            <p className="mt-1 text-xs text-white/50">
              {latitude}, {longitude}
            </p>
          ) : null}
        </div>

        {reverseLoading ? (
          <p className="text-white/50">Updating exact location...</p>
        ) : null}
      </div>
    </div>
  )
}
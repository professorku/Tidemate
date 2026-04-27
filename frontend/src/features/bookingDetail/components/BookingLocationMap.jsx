export default function BookingLocationMap({
  locationName,
  latitude,
  longitude,
}) {
  const hasCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    !Number.isNaN(Number(latitude)) &&
    !Number.isNaN(Number(longitude))

  if (!hasCoordinates) {
    return (
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
        <div className="flex h-72 items-center justify-center px-6 text-center text-slate-500">
          <div>
            <p className="text-lg font-semibold text-slate-700">Map unavailable</p>
            <p className="mt-2">
              This booking does not currently have saved coordinates for the boat location.
            </p>
            {locationName ? <p className="mt-2 font-medium">{locationName}</p> : null}
          </div>
        </div>
      </div>
    )
  }

  const lat = Number(latitude)
  const lng = Number(longitude)

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${
    lat - 0.02
  }%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`

  const openMapHref = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <iframe
        title="Boat location map"
        src={mapSrc}
        className="h-72 w-full"
        loading="lazy"
      />

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Boat location
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {locationName || 'Saved boat location'}
          </p>
        </div>

        <a
          href={openMapHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Open larger map
        </a>
      </div>
    </div>
  )
}
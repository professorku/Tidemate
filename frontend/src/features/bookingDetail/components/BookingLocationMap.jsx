import { useEffect } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function parseRadiusKm(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

function MapResizer() {
  const map = useMap()

  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => clearTimeout(timeout)
  }, [map])

  return null
}

const bookingMarkerIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      position: relative;
      width: 30px;
      height: 30px;
      border-radius: 9999px;
      background: #0f2f4f;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 6px 16px rgba(15, 47, 79, 0.22);
      border: 2px solid #d4af37;
      line-height: 1;
    ">
      ⚓
      <div style="
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 9px;
        height: 9px;
        background: #0f2f4f;
        border-right: 2px solid #d4af37;
        border-bottom: 2px solid #d4af37;
      "></div>
    </div>
  `,
  iconSize: [30, 39],
  iconAnchor: [15, 34],
  popupAnchor: [0, -30],
})

export default function BookingLocationMap({
  locationName,
  pickupAddress,
  pickupInstructions,
  latitude,
  longitude,
  locationPrecision = 'approximate',
  locationRadiusKm = 5,
  exactLocationAvailable = false,
  disclosureMessage,
}) {
  const lat = parseCoordinate(latitude)
  const lng = parseCoordinate(longitude)
  const hasCoordinates = lat !== null && lng !== null

  const isExact = Boolean(exactLocationAvailable) || locationPrecision === 'exact'
  const radiusKm = parseRadiusKm(locationRadiusKm)
  const displayLocation = isExact ? pickupAddress || locationName : locationName
  const message =
    disclosureMessage ||
    (isExact
      ? 'Exact pickup location is available for this booking.'
      : 'Exact pickup location is shared after the booking is confirmed.')

  if (!hasCoordinates) {
    return (
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
        <div className="flex h-72 items-center justify-center px-6 text-center text-slate-500">
          <div>
            <p className="text-lg font-semibold text-slate-700">Map unavailable</p>
            <p className="mt-2">
              This booking does not currently have saved coordinates for the boat location.
            </p>
            {displayLocation ? <p className="mt-2 font-medium">{displayLocation}</p> : null}
          </div>
        </div>
      </div>
    )
  }

  const position = [lat, lng]
  const zoom = isExact ? 13 : 10
  const openMapHref = isExact
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`
    : `https://www.openstreetmap.org/#map=10/${lat}/${lng}`

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="h-72 w-full">
        <MapContainer
          center={position}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full"
          attributionControl={true}
        >
          <MapResizer />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {isExact ? (
            <Marker position={position} icon={bookingMarkerIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="text-base font-bold text-slate-900">
                    {displayLocation || 'Boat pickup location'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Exact pickup point for your trip.
                  </p>
                  {pickupInstructions ? (
                    <p className="mt-2 text-sm text-slate-600">
                      {pickupInstructions}
                    </p>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          ) : (
            <Circle
              center={position}
              radius={Math.max(radiusKm, 5) * 1000}
              pathOptions={{
                color: '#0f2f4f',
                fillColor: '#0f2f4f',
                fillOpacity: 0.12,
                opacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="text-base font-bold text-slate-900">Approximate area</p>
                  <p className="mt-1 text-sm text-slate-600">
                    The exact pickup point is shared after confirmation.
                  </p>
                </div>
              </Popup>
            </Circle>
          )}
        </MapContainer>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {isExact ? 'Exact boat location' : 'Approximate boat area'}
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {displayLocation || 'Saved boat location'}
          </p>

          <p className="mt-1 max-w-xl text-sm text-slate-600">
            {message}
          </p>
        </div>

        <a
          href={openMapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Open larger map
        </a>
      </div>
    </div>
  )
}
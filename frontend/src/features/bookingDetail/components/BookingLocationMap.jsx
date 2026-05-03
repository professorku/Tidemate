import { useEffect } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function parseRadiusKm(value, fallback = 5) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
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

function MapFlyTo({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return

    map.setView(center, zoom, { animate: true })
  }, [map, center, zoom])

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
}) {
  const lat = parseCoordinate(latitude)
  const lng = parseCoordinate(longitude)
  const hasCoordinates = lat !== null && lng !== null

  const isExact = Boolean(exactLocationAvailable) || locationPrecision === 'exact'
  const radiusKm = parseRadiusKm(locationRadiusKm, 5)
  const displayLocation = isExact ? pickupAddress || locationName : locationName

  if (!hasCoordinates) {
    return (
      <div className="overflow-hidden rounded-[24px] border border-gold/20 bg-[#071d32]/70">
        <div className="flex h-80 items-center justify-center px-6 text-center md:h-[360px]">
          <div>
            <p className="text-lg font-extrabold text-white">Map unavailable</p>

            <p className="mt-2 text-sm leading-6 text-white/60">
              This booking does not currently have saved coordinates for the boat location.
            </p>

            {displayLocation ? (
              <p className="mt-3 font-semibold text-gold">
                {displayLocation}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const position = [lat, lng]
  const zoom = isExact ? 13 : radiusKm <= 3 ? 11 : radiusKm <= 8 ? 10 : 9
  const tileUrl = isExact
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  return (
    <div className="overflow-hidden rounded-[24px] bg-white shadow-soft">
      <div className="relative h-80 w-full md:h-[360px]">
        <MapContainer
          center={position}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full"
          attributionControl={true}
        >
          <MapResizer />
          <MapFlyTo center={position} zoom={zoom} />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            url={tileUrl}
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
                  <p className="text-base font-bold text-slate-900">
                    Approximate area
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    The exact pickup point is shared after confirmation.
                  </p>
                </div>
              </Popup>
            </Circle>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
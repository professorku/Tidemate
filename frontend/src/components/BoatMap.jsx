import { useEffect } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatLocationSubtitle,
} from '../utils/locationPrivacy'

function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function parseRadiusKm(value, fallback = 8) {
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

const exactMarkerIcon = L.divIcon({
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

function FallbackLocationCard({ locationLabel }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <div className="flex min-h-[260px] flex-col items-center justify-center bg-slate-50 px-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mist text-3xl">
          📍
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Public location
        </p>

        <h3 className="mt-2 text-2xl font-bold text-slate-900">
          {locationLabel || 'Location available after booking'}
        </h3>

        <p className="mt-3 max-w-md text-slate-600">
          The exact pickup point is only visible to the owner, admins, and renters
          with a confirmed booking.
        </p>
      </div>
    </div>
  )
}

export default function BoatMap({ boat }) {
  const lat = parseCoordinate(boat?.latitude ?? boat?.lat)
  const lng = parseCoordinate(boat?.longitude ?? boat?.lng)
  const hasCoordinates = lat !== null && lng !== null

  const exactLocationAvailable = canShowExactLocation(boat)
  const locationLabel = getBoatLocationLabel(boat, 'Location available after booking')
  const locationSubtitle = getBoatLocationSubtitle(boat)

  const isApproximateOnly = !exactLocationAvailable && hasCoordinates

  const publicDisclosureMessage =
    boat?.location_disclosure_message ||
    'This map shows the approximate area only. The exact pickup point is shared after booking confirmation.'

  const exactDisclosureMessage =
    boat?.location_disclosure_message ||
    'Exact pickup location is available.'

  if (!hasCoordinates) {
    return <FallbackLocationCard locationLabel={locationLabel} />
  }

  if (isApproximateOnly) {
    const position = [lat, lng]
    const radiusKm = parseRadiusKm(boat?.location_radius_km, 8)
    const radiusMeters = radiusKm * 1000
    const zoom = radiusKm <= 3 ? 11 : radiusKm <= 8 ? 10 : 9

    return (
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
        
              <p className="text-sm text-slate-500">
                {publicDisclosureMessage}
              </p>
            </div>
          </div>
        </div>

        <div className="relative h-[360px] w-full md:h-[420px]">
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
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <Circle
              center={position}
              radius={radiusMeters}
              pathOptions={{
                color: '#0f2f4f',
                weight: 2,
                fillColor: '#0f2f4f',
                fillOpacity: 0.15,
              }}
            />
          </MapContainer>

          <div className="pointer-events-none absolute bottom-4 left-4 max-w-xs rounded-2xl bg-white/92 px-4 py-3 shadow-lg backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Approximate area
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {locationLabel || 'Public area'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Approx. radius: {radiusKm} km
            </p>
          </div>
        </div>
      </div>
    )
  }

  const position = [lat, lng]
  const zoom = 13

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Exact pickup location
            </h3>
            <p className="text-sm text-slate-500">
              {exactDisclosureMessage}
            </p>
          </div>

          {locationLabel ? (
            <div className="max-w-xs rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="line-clamp-2">{locationLabel}</span>
            </div>
          ) : null}
        </div>

        {locationSubtitle ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pickup instructions
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
              {locationSubtitle}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative h-[360px] w-full md:h-[420px]">
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
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <Marker position={position} icon={exactMarkerIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="text-base font-bold text-slate-900">
                  {boat?.title || 'Boat'}
                </p>

                {locationLabel ? (
                  <p className="mt-1 text-sm text-slate-600">{locationLabel}</p>
                ) : null}

                {locationSubtitle ? (
                  <p className="mt-2 text-sm text-slate-600">{locationSubtitle}</p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {boat?.boat_type ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                      {boat.boat_type}
                    </span>
                  ) : null}

                  {boat?.guests ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {boat.guests} guests
                    </span>
                  ) : null}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        <div className="pointer-events-none absolute bottom-4 left-4 max-w-xs rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Exact location
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  )
}
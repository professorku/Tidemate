import { useEffect } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import { boatMarkerIcon } from './maps/boatMarkerIcon'
import 'leaflet/dist/leaflet.css'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatLocationSubtitle,
} from '../utils/locationPrivacy'

const MAP_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png'

const MAP_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO'

function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function parseRadiusKm(value, fallback = 50) {
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



function FallbackLocationCard({ locationLabel }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <div className="flex min-h-[360px] flex-col items-center justify-center bg-slate-50 px-6 py-10 text-center md:min-h-[420px]">
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

function MapShell({ children }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <div className="relative h-[360px] w-full md:h-[420px]">
        {children}
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

  if (!hasCoordinates) {
    return <FallbackLocationCard locationLabel={locationLabel} />
  }

  if (isApproximateOnly) {
    const position = [lat, lng]
    const radiusKm = parseRadiusKm(boat?.location_radius_km, 50)
    const radiusMeters = radiusKm * 1000
    const zoom = radiusKm <= 3 ? 11 : radiusKm <= 8 ? 10 : 9

    return (
      <MapShell>
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
            attribution={MAP_ATTRIBUTION}
            url={MAP_TILE_URL}
            maxZoom={19}
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
      </MapShell>
    )
  }

  const position = [lat, lng]
  const zoom = 13

  return (
    <MapShell>
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
          attribution={MAP_ATTRIBUTION}
          url={MAP_TILE_URL}
        />

        <Marker position={position} icon={boatMarkerIcon}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="text-base font-bold text-slate-900">
                {boat?.title || 'Boat'}
              </p>

              {locationLabel ? (
                <p className="mt-1 text-sm text-slate-600">
                  {locationLabel}
                </p>
              ) : null}

              {locationSubtitle ? (
                <p className="mt-2 text-sm text-slate-600">
                  {locationSubtitle}
                </p>
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
    </MapShell>
  )
}
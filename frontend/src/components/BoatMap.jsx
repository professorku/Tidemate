import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
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

function MapFlyTo({ center }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return
    map.setView(center, 12, {
      animate: true,
    })
  }, [map, center])

  return null
}

const boatMarkerIcon = L.divIcon({
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

export default function BoatMap({ boat }) {
  const lat = parseCoordinate(boat?.latitude ?? boat?.lat)
  const lng = parseCoordinate(boat?.longitude ?? boat?.lng)
  const hasCoordinates = lat !== null && lng !== null

  if (!hasCoordinates) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <div className="flex h-[360px] flex-col items-center justify-center bg-slate-50 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mist text-3xl">
            📍
          </div>
          <h3 className="mt-5 text-xl font-bold text-slate-900">Location unavailable</h3>
          <p className="mt-2 max-w-md text-slate-500">
            This boat does not have map coordinates yet. Add latitude and longitude to
            display its location here.
          </p>
          {boat?.location_name ? (
            <div className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              {boat.location_name}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  const position = [lat, lng]

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Explore the area</h3>
            <p className="text-sm text-slate-500">
              Approximate boat location for planning your trip
            </p>
          </div>

          {boat?.location_name ? (
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              {boat.location_name}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative h-[360px] w-full md:h-[420px]">
        <MapContainer
          center={position}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
          attributionControl={true}
        >
          <MapResizer />
          <MapFlyTo center={position} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <Marker position={position} icon={boatMarkerIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="text-base font-bold text-slate-900">{boat?.title || 'Boat'}</p>

                {boat?.location_name ? (
                  <p className="mt-1 text-sm text-slate-600">{boat.location_name}</p>
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

        <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            TideMate location
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  )
}
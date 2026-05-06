import { useEffect } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { boatMarkerIcon } from '../../../components/maps/boatMarkerIcon'

const POSITRON_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

const CARTO_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO'

function FlyToLocation({ center, zoom = 12 }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return
    map.flyTo(center, zoom, { animate: true, duration: 1.1 })
  }, [map, center, zoom])

  return null
}

function InvalidateMapSize() {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => clearTimeout(timer)
  }, [map])

  return null
}

function LocationEvents({ onMapPick }) {
  useMapEvents({
    click(e) {
      onMapPick?.(e.latlng)
    },
  })

  return null
}

export default function LocationPickerLeafletMap({
  markerPosition,
  initialCenter,
  locationName,
  onPickCoordinates,
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200">
      <div className="h-[420px] w-full">
        <MapContainer
          center={markerPosition || initialCenter}
          zoom={markerPosition ? 12 : 6}
          scrollWheelZoom
          className="h-full w-full"
        >
          <InvalidateMapSize />

          <FlyToLocation
            center={markerPosition || initialCenter}
            zoom={markerPosition ? 12 : 6}
          />

          <LocationEvents onMapPick={onPickCoordinates} />

          <TileLayer
            attribution={CARTO_ATTRIBUTION}
            url={POSITRON_TILE_URL}
          />

          {markerPosition ? (
            <Marker
              position={markerPosition}
              icon={boatMarkerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const latlng = event.target.getLatLng()
                  onPickCoordinates(latlng)
                },
              }}
            >
              <Popup>
                <div className="min-w-[190px]">
                  <p className="text-base font-bold text-slate-900">
                    {locationName || 'Boat location'}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>
    </div>
  )
}
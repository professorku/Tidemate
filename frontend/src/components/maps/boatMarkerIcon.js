import L from 'leaflet'

export const boatMarkerIcon = L.divIcon({
  className: 'boat-location-marker',
  html: `
    <div class="boat-location-marker__bubble">
      ⚓
      <div class="boat-location-marker__tip"></div>
    </div>
  `,
  iconSize: [30, 39],
  iconAnchor: [15, 34],
  popupAnchor: [0, -30],
})
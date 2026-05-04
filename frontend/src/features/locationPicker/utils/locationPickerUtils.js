export const DEFAULT_CENTER = [59.9139, 10.7522]
export const COORDINATE_DECIMALS = 6

export function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

export function roundCoordinate(value) {
  const number = parseCoordinate(value)

  if (number === null) return null

  return Number(number.toFixed(COORDINATE_DECIMALS))
}

export function formatCoordinate(value) {
  const number = roundCoordinate(value)

  if (number === null) return ''

  return number.toFixed(COORDINATE_DECIMALS)
}

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || ''
}

export function normalizeLocationName(result) {
  if (!result) return ''

  const address = result.address || {}

  // Important:
  // Do NOT use result.display_name here.
  // display_name often contains exact house number, road, marina, postcode, etc.
  return firstNonEmpty(
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
    address.state,
    address.region,
    address.country
  )
}

export function getCityOrCounty(address = {}, displayName = '') {
  const publicName = firstNonEmpty(
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
    address.state_district,
    address.state,
    address.region,
    address.country
  )

  if (publicName) return publicName

  return displayName.split(',')[0]?.trim() || ''
}

export function getExactAddress(address = {}, displayName = '', latitude, longitude) {
  const streetParts = [address.road, address.house_number].filter(Boolean)
  const localParts = [
    address.neighbourhood,
    address.suburb,
    address.city || address.town || address.village || address.municipality,
    address.county,
  ].filter(Boolean)

  const exactParts = []

  if (streetParts.length) {
    exactParts.push(streetParts.join(' '))
  }

  localParts.forEach((part) => {
    if (!exactParts.includes(part)) {
      exactParts.push(part)
    }
  })

  if (exactParts.length) {
    return exactParts.slice(0, 3).join(', ')
  }

  const fromDisplayName = displayName
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')

  if (fromDisplayName) return fromDisplayName

  const formattedLatitude = formatCoordinate(latitude)
  const formattedLongitude = formatCoordinate(longitude)

  if (formattedLatitude && formattedLongitude) {
    return `${formattedLatitude}, ${formattedLongitude}`
  }

  return ''
}

export function normalizeSearchResult(result) {
  const latitude = roundCoordinate(result.latitude ?? result.lat)
  const longitude = roundCoordinate(result.longitude ?? result.lon)

  if (latitude === null || longitude === null) return null

  const address = result.address || {}
  const displayName = result.display_name || result.displayName || ''
  const id = result.id || result.place_id || `${latitude}-${longitude}`

  return {
    ...result,
    id,
    place_id: result.place_id || id,
    lat: result.lat ?? formatCoordinate(latitude),
    lon: result.lon ?? formatCoordinate(longitude),
    latitude,
    longitude,
    display_name: displayName,
    location_name: result.location_name || getCityOrCounty(address, displayName),
    pickup_address:
      result.pickup_address || getExactAddress(address, displayName, latitude, longitude),
  }
}

export function getCoordinatesFromPickerValue(value) {
  if (!value) return null

  if (Array.isArray(value) && value.length >= 2) {
    const latitude = roundCoordinate(value[0])
    const longitude = roundCoordinate(value[1])

    if (latitude !== null && longitude !== null) {
      return { latitude, longitude }
    }
  }

  if (value.latlng) {
    const latitude = roundCoordinate(value.latlng.lat)
    const longitude = roundCoordinate(value.latlng.lng)

    if (latitude !== null && longitude !== null) {
      return { latitude, longitude }
    }
  }

  const latitude = roundCoordinate(value.lat ?? value.latitude)
  const longitude = roundCoordinate(value.lng ?? value.lon ?? value.longitude)

  if (latitude !== null && longitude !== null) {
    return { latitude, longitude }
  }

  return null
}
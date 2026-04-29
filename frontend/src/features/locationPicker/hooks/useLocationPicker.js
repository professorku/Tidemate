import { useCallback, useEffect, useMemo, useState } from 'react'

const DEFAULT_CENTER = [59.9139, 10.7522]
const COORDINATE_DECIMALS = 6

function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function roundCoordinate(value) {
  const number = parseCoordinate(value)
  if (number === null) return null

  return Number(number.toFixed(COORDINATE_DECIMALS))
}

function formatCoordinate(value) {
  const number = roundCoordinate(value)
  if (number === null) return ''

  return number.toFixed(COORDINATE_DECIMALS)
}

function getCityOrCounty(address = {}, displayName = '') {
  const publicName =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state_district ||
    address.state

  if (publicName) return publicName

  return displayName.split(',')[0]?.trim() || ''
}

function getExactAddress(address = {}, displayName = '', latitude, longitude) {
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

function normalizeSearchResult(result) {
  const latitude = roundCoordinate(result.lat)
  const longitude = roundCoordinate(result.lon)

  if (latitude === null || longitude === null) return null

  const address = result.address || {}
  const displayName = result.display_name || ''

  return {
    id: result.place_id || `${latitude}-${longitude}`,
    latitude,
    longitude,
    display_name: displayName,
    location_name: getCityOrCounty(address, displayName),
    pickup_address: getExactAddress(address, displayName, latitude, longitude),
  }
}

async function searchPlaces(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '5')
  url.searchParams.set('countrycodes', 'no')
  url.searchParams.set('q', query)

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Could not search for location.')
  }

  const data = await response.json()

  return data.map(normalizeSearchResult).filter(Boolean)
}

async function reverseGeocode(latitude, longitude) {
  const roundedLatitude = roundCoordinate(latitude)
  const roundedLongitude = roundCoordinate(longitude)

  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('zoom', '18')
  url.searchParams.set('lat', String(roundedLatitude))
  url.searchParams.set('lon', String(roundedLongitude))

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Could not fetch location details.')
  }

  const data = await response.json()
  const address = data.address || {}
  const displayName = data.display_name || ''

  return {
    location_name: getCityOrCounty(address, displayName),
    pickup_address: getExactAddress(
      address,
      displayName,
      roundedLatitude,
      roundedLongitude,
    ),
  }
}

function getCoordinatesFromPickerValue(value) {
  if (!value) return null

  if (Array.isArray(value) && value.length >= 2) {
    const latitude = roundCoordinate(value[0])
    const longitude = roundCoordinate(value[1])
    if (latitude !== null && longitude !== null) return { latitude, longitude }
  }

  if (value.latlng) {
    const latitude = roundCoordinate(value.latlng.lat)
    const longitude = roundCoordinate(value.latlng.lng)
    if (latitude !== null && longitude !== null) return { latitude, longitude }
  }

  const latitude = roundCoordinate(value.lat ?? value.latitude)
  const longitude = roundCoordinate(value.lng ?? value.lon ?? value.longitude)

  if (latitude !== null && longitude !== null) {
    return { latitude, longitude }
  }

  return null
}

export function useLocationPicker({
  latitude,
  longitude,
  locationName,
  pickupAddress,
  onLocationChange,
}) {
  const parsedLatitude = roundCoordinate(latitude)
  const parsedLongitude = roundCoordinate(longitude)

  const [markerPosition, setMarkerPosition] = useState(() => {
    if (parsedLatitude !== null && parsedLongitude !== null) {
      return [parsedLatitude, parsedLongitude]
    }

    return null
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [reverseLoading, setReverseLoading] = useState(false)

  const initialCenter = useMemo(() => {
    if (markerPosition) return markerPosition
    return DEFAULT_CENTER
  }, [markerPosition])

  useEffect(() => {
    if (parsedLatitude !== null && parsedLongitude !== null) {
      setMarkerPosition([parsedLatitude, parsedLongitude])
    }
  }, [parsedLatitude, parsedLongitude])

  useEffect(() => {
    const trimmed = searchQuery.trim()

    if (trimmed.length < 2) {
      setResults([])
      setSearchError('')
      setSearching(false)
      return undefined
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      setSearching(true)
      setSearchError('')

      try {
        const searchResults = await searchPlaces(trimmed)
        setResults(searchResults)
      } catch (error) {
        if (controller.signal.aborted) return
        setSearchError('Could not search for that location.')
        setResults([])
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false)
        }
      }
    }, 350)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [searchQuery])

  const applyLocation = useCallback(
    ({ latitude: nextLatitude, longitude: nextLongitude, location_name, pickup_address }) => {
      const roundedLatitude = roundCoordinate(nextLatitude)
      const roundedLongitude = roundCoordinate(nextLongitude)

      if (roundedLatitude === null || roundedLongitude === null) return

      const latitudeString = formatCoordinate(roundedLatitude)
      const longitudeString = formatCoordinate(roundedLongitude)

      setMarkerPosition([roundedLatitude, roundedLongitude])

      onLocationChange?.({
        latitude: latitudeString,
        longitude: longitudeString,
        location_name: location_name || locationName || '',
        pickup_address:
          pickup_address ||
          pickupAddress ||
          `${latitudeString}, ${longitudeString}`,
      })
    },
    [locationName, pickupAddress, onLocationChange],
  )

  const handlePickCoordinates = useCallback(
    async (value) => {
      const coordinates = getCoordinatesFromPickerValue(value)
      if (!coordinates) return

      const { latitude: pickedLatitude, longitude: pickedLongitude } = coordinates

      setMarkerPosition([pickedLatitude, pickedLongitude])
      setReverseLoading(true)
      setSearchError('')

      try {
        const reverseResult = await reverseGeocode(pickedLatitude, pickedLongitude)

        applyLocation({
          latitude: pickedLatitude,
          longitude: pickedLongitude,
          location_name: reverseResult.location_name,
          pickup_address: reverseResult.pickup_address,
        })
      } catch (error) {
        applyLocation({
          latitude: pickedLatitude,
          longitude: pickedLongitude,
          location_name: locationName || '',
          pickup_address: `${formatCoordinate(pickedLatitude)}, ${formatCoordinate(pickedLongitude)}`,
        })
      } finally {
        setReverseLoading(false)
      }
    },
    [applyLocation, locationName],
  )

  const handleSearchSelect = useCallback(
    async (result) => {
      if (!result) return

      const selectedLatitude = roundCoordinate(result.latitude)
      const selectedLongitude = roundCoordinate(result.longitude)

      if (selectedLatitude === null || selectedLongitude === null) return

      setSearchQuery(result.location_name || result.display_name || '')
      setResults([])

      setMarkerPosition([selectedLatitude, selectedLongitude])
      setReverseLoading(true)

      try {
        const reverseResult = await reverseGeocode(selectedLatitude, selectedLongitude)

        applyLocation({
          latitude: selectedLatitude,
          longitude: selectedLongitude,
          location_name: reverseResult.location_name || result.location_name,
          pickup_address: reverseResult.pickup_address || result.pickup_address,
        })
      } catch (error) {
        applyLocation({
          latitude: selectedLatitude,
          longitude: selectedLongitude,
          location_name: result.location_name,
          pickup_address: result.pickup_address,
        })
      } finally {
        setReverseLoading(false)
      }
    },
    [applyLocation],
  )

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setResults([])
    setSearchError('')
  }, [])

  return {
    initialCenter,
    markerPosition,
    searchQuery,
    setSearchQuery,
    results,
    searching,
    searchError,
    reverseLoading,
    handlePickCoordinates,
    handleSearchSelect,
    handleClearSearch,
  }
}
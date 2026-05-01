import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  reverseGeocodeLocation,
  searchGeocodingPlaces,
} from '../../../api/domains/geocoding'

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

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || ''
}

function getCityOrCounty(address = {}, displayName = '') {
  const publicName = firstNonEmpty(
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
    address.state_district,
    address.state,
    address.region,
    address.country,
  )

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

async function searchPlaces(query, signal) {
  const data = await searchGeocodingPlaces(query, { signal })

  return data.map(normalizeSearchResult).filter(Boolean)
}

async function reverseGeocode(latitude, longitude) {
  const roundedLatitude = roundCoordinate(latitude)
  const roundedLongitude = roundCoordinate(longitude)

  if (roundedLatitude === null || roundedLongitude === null) {
    throw new Error('Invalid coordinates.')
  }

  const data = await reverseGeocodeLocation({
    latitude: roundedLatitude,
    longitude: roundedLongitude,
  })

  const address = data.address || {}
  const displayName = data.display_name || ''

  return {
    location_name: data.location_name || getCityOrCounty(address, displayName),
    pickup_address:
      data.pickup_address ||
      getExactAddress(address, displayName, roundedLatitude, roundedLongitude),
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
        const searchResults = await searchPlaces(trimmed, controller.signal)
        setResults(searchResults)
      } catch (error) {
        if (controller.signal.aborted) return

        const throttled = error?.status === 429

        setSearchError(
          throttled
            ? 'Too many location searches. Please wait a moment and try again.'
            : 'Could not search for that location.',
        )

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
      } catch {
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
      } catch {
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
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  normalizeLocationName,
  parseCoordinate,
} from '../utils/locationPickerUtils'

export function useLocationPicker({
  latitude,
  longitude,
  locationName,
  onLocationChange,
}) {
  const initialCenter = useMemo(() => {
    const lat = parseCoordinate(latitude)
    const lng = parseCoordinate(longitude)

    if (lat !== null && lng !== null) {
      return [lat, lng]
    }

    return [59.9139, 10.7522]
  }, [latitude, longitude])

  const [markerPosition, setMarkerPosition] = useState(() => {
    const lat = parseCoordinate(latitude)
    const lng = parseCoordinate(longitude)
    return lat !== null && lng !== null ? [lat, lng] : null
  })

  const [searchQuery, setSearchQuery] = useState(locationName || '')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [reverseLoading, setReverseLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    const lat = parseCoordinate(latitude)
    const lng = parseCoordinate(longitude)
    if (lat !== null && lng !== null) {
      setMarkerPosition([lat, lng])
    }
  }, [latitude, longitude])

  useEffect(() => {
    setSearchQuery(locationName || '')
  }, [locationName])

  const performSearch = async (query) => {
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setSearchError('')
      return
    }

    try {
      setSearching(true)
      setSearchError('')

      const params = new URLSearchParams({
        q: trimmed,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '6',
      })

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!res.ok) {
        throw new Error('Search request failed')
      }

      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setResults([])
      setSearchError('Could not search for that location right now.')
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!searchQuery.trim()) {
      setResults([])
      setSearchError('')
      return
    }

    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery)
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const reverseGeocode = async (lat, lng) => {
    try {
      setReverseLoading(true)

      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: 'jsonv2',
        addressdetails: '1',
      })

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!res.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await res.json()
      const nextName = normalizeLocationName(data)

      onLocationChange?.({
        latitude: String(lat),
        longitude: String(lng),
        location_name: nextName,
      })

      if (nextName) {
        setSearchQuery(nextName)
      }
    } catch (err) {
      console.error(err)

      onLocationChange?.({
        latitude: String(lat),
        longitude: String(lng),
        location_name: locationName || '',
      })
    } finally {
      setReverseLoading(false)
    }
  }

  const handlePickCoordinates = async (latlng) => {
    const lat = Number(latlng.lat).toFixed(6)
    const lng = Number(latlng.lng).toFixed(6)

    setMarkerPosition([Number(lat), Number(lng)])
    await reverseGeocode(lat, lng)
  }

  const handleSearchSelect = (result) => {
    const lat = Number(result.lat)
    const lng = Number(result.lon)
    const nextName = normalizeLocationName(result)

    setMarkerPosition([lat, lng])
    setResults([])
    setSearchQuery(nextName || result.display_name || '')

    onLocationChange?.({
      latitude: String(lat),
      longitude: String(lng),
      location_name: nextName || result.display_name || '',
    })
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setResults([])
    setSearchError('')
  }

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
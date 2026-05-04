import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_CENTER,
  formatCoordinate,
  getCoordinatesFromPickerValue,
  roundCoordinate,
} from '../utils/locationPickerUtils'

export function useMapSelection({
  latitude,
  longitude,
  locationName,
  pickupAddress,
  onLocationChange,
  reverseGeocode,
  setSearchQuery,
  setResults,
  setSearchError,
}) {
  const parsedLatitude = roundCoordinate(latitude)
  const parsedLongitude = roundCoordinate(longitude)

  const [markerPosition, setMarkerPosition] = useState(() => {
    if (parsedLatitude !== null && parsedLongitude !== null) {
      return [parsedLatitude, parsedLongitude]
    }

    return null
  })

  const initialCenter = useMemo(() => {
    if (markerPosition) return markerPosition

    return DEFAULT_CENTER
  }, [markerPosition])

  useEffect(() => {
    if (parsedLatitude !== null && parsedLongitude !== null) {
      setMarkerPosition([parsedLatitude, parsedLongitude])
    }
  }, [parsedLatitude, parsedLongitude])

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
    [locationName, pickupAddress, onLocationChange]
  )

  const handlePickCoordinates = useCallback(
    async (value) => {
      const coordinates = getCoordinatesFromPickerValue(value)

      if (!coordinates) return

      const { latitude: pickedLatitude, longitude: pickedLongitude } = coordinates

      setMarkerPosition([pickedLatitude, pickedLongitude])
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
      }
    },
    [applyLocation, locationName, reverseGeocode, setSearchError]
  )

  const handleSearchSelect = useCallback(
    async (result) => {
      if (!result) return

      const selectedLatitude = roundCoordinate(result.latitude)
      const selectedLongitude = roundCoordinate(result.longitude)

      if (selectedLatitude === null || selectedLongitude === null) return

      setSearchQuery(result.location_name || result.display_name || '')
      setResults([])
      setSearchError('')

      setMarkerPosition([selectedLatitude, selectedLongitude])

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
      }
    },
    [applyLocation, reverseGeocode, setResults, setSearchError, setSearchQuery]
  )

  return {
    initialCenter,
    markerPosition,
    handlePickCoordinates,
    handleSearchSelect,
  }
}
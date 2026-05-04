import { useCallback, useState } from 'react'
import { useGeocodeSearch } from './useGeocodeSearch'
import { useMapSelection } from './useMapSelection'
import { useReverseGeocode } from './useReverseGeocode'

export function useLocationPicker({
  latitude,
  longitude,
  locationName,
  pickupAddress,
  onLocationChange,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const {
    results,
    setResults,
    searching,
    searchError,
    setSearchError,
    clearSearchResults,
  } = useGeocodeSearch(searchQuery)

  const { reverseLoading, reverseGeocode } = useReverseGeocode()

  const {
    initialCenter,
    markerPosition,
    handlePickCoordinates,
    handleSearchSelect,
  } = useMapSelection({
    latitude,
    longitude,
    locationName,
    pickupAddress,
    onLocationChange,
    reverseGeocode,
    setSearchQuery,
    setResults,
    setSearchError,
  })

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    clearSearchResults()
  }, [clearSearchResults])

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
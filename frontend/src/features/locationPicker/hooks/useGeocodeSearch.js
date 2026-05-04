import { useEffect, useState } from 'react'
import { searchGeocodingPlaces } from '../../../api/domains/geocoding'
import { normalizeSearchResult } from '../utils/locationPickerUtils'
import { useDebouncedQuery } from './useDebouncedQuery'

async function searchPlaces(query, signal) {
  const data = await searchGeocodingPlaces(query, { signal })

  return data.map(normalizeSearchResult).filter(Boolean)
}

export function useGeocodeSearch(searchQuery) {
  const debouncedQuery = useDebouncedQuery(searchQuery, 350)

  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    const trimmed = debouncedQuery.trim()

    if (trimmed.length < 2) {
      setResults([])
      setSearchError('')
      setSearching(false)
      return undefined
    }

    const controller = new AbortController()

    async function loadSearchResults() {
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
            : 'Could not search for that location.'
        )

        setResults([])
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false)
        }
      }
    }

    void loadSearchResults()

    return () => {
      controller.abort()
    }
  }, [debouncedQuery])

  const clearSearchResults = () => {
    setResults([])
    setSearchError('')
    setSearching(false)
  }

  return {
    results,
    setResults,
    searching,
    searchError,
    setSearchError,
    clearSearchResults,
  }
}
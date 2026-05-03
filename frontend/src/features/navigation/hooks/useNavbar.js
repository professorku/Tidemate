import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const AUTO_SEARCH_DELAY_MS = 250

const MARKETPLACE_FILTER_KEYS = [
  'q',
  'boat_type',
  'start_date',
  'end_date',
  'min_guests',
  'min_price',
  'max_price',
]

function getSearchStateFromParams(searchParams) {
  return {
    query: searchParams.get('q') || '',
    boatType: searchParams.get('boat_type') || '',
    startDate: searchParams.get('start_date') || '',
    endDate: searchParams.get('end_date') || '',
  }
}

function hasMarketplaceParams(searchParams) {
  return MARKETPLACE_FILTER_KEYS.some((key) => Boolean(searchParams.get(key)))
}

function setParam(params, key, value) {
  const trimmed = String(value || '').trim()

  if (trimmed) {
    params.set(key, trimmed)
    return
  }

  params.delete(key)
}

function getAutoSearchSignature(searchState) {
  return JSON.stringify({
    query: String(searchState.query || '').trim(),
    boatType: String(searchState.boatType || '').trim(),
    startDate: String(searchState.startDate || '').trim(),
    endDate: String(searchState.endDate || '').trim(),
  })
}

function buildMarketplaceParams(baseSearch, searchState, { resetPage = true } = {}) {
  const nextParams = new URLSearchParams(baseSearch)

  setParam(nextParams, 'q', searchState.query)
  setParam(nextParams, 'boat_type', searchState.boatType)
  setParam(nextParams, 'start_date', searchState.startDate)
  setParam(nextParams, 'end_date', searchState.endDate)

  if (resetPage) {
    nextParams.delete('page')
  }

  return nextParams
}

export function useNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const urlState = useMemo(() => {
    const params = new URLSearchParams(location.search)

    return {
      ...getSearchStateFromParams(params),
      hasMarketplaceSearch: hasMarketplaceParams(params),
    }
  }, [location.search])

  const urlAutoSearchSignature = useMemo(
    () => getAutoSearchSignature(urlState),
    [urlState]
  )

  const [query, setQuery] = useState(urlState.query)
  const [boatType, setBoatType] = useState(urlState.boatType)
  const [startDate, setStartDate] = useState(urlState.startDate)
  const [endDate, setEndDate] = useState(urlState.endDate)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const lastSyncedAutoSearchSignatureRef = useRef(urlAutoSearchSignature)

  const currentAutoSearchSignature = useMemo(
    () =>
      getAutoSearchSignature({
        query,
        boatType,
        startDate,
        endDate,
      }),
    [boatType, endDate, query, startDate]
  )

  useEffect(() => {
    setQuery(urlState.query)
    setBoatType(urlState.boatType)
    setStartDate(urlState.startDate)
    setEndDate(urlState.endDate)

    lastSyncedAutoSearchSignatureRef.current = urlAutoSearchSignature
  }, [
    urlAutoSearchSignature,
    urlState.boatType,
    urlState.endDate,
    urlState.query,
    urlState.startDate,
  ])

  useEffect(() => {
    setFiltersOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isHomePage) return undefined

    if (
      currentAutoSearchSignature === lastSyncedAutoSearchSignatureRef.current
    ) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      const nextParams = buildMarketplaceParams(
        location.search,
        {
          query,
          boatType,
          startDate,
          endDate,
        },
        {
          resetPage: true,
        }
      )

      const nextSearch = nextParams.toString()
      const currentSearch = new URLSearchParams(location.search).toString()

      if (nextSearch === currentSearch) {
        lastSyncedAutoSearchSignatureRef.current = currentAutoSearchSignature
        return
      }

      lastSyncedAutoSearchSignatureRef.current = currentAutoSearchSignature

      navigate(nextSearch ? `/?${nextSearch}` : '/', {
        replace: true,
      })
    }, AUTO_SEARCH_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    boatType,
    currentAutoSearchSignature,
    endDate,
    isHomePage,
    location.search,
    navigate,
    query,
    startDate,
  ])

  const handleSearch = useCallback(
    (event) => {
      event.preventDefault()

      const nextParams = buildMarketplaceParams(
        isHomePage ? location.search : '',
        {
          query,
          boatType,
          startDate,
          endDate,
        },
        {
          resetPage: true,
        }
      )

      const nextSearch = nextParams.toString()

      lastSyncedAutoSearchSignatureRef.current = getAutoSearchSignature({
        query,
        boatType,
        startDate,
        endDate,
      })

      navigate(nextSearch ? `/?${nextSearch}` : '/')
    },
    [boatType, endDate, isHomePage, location.search, navigate, query, startDate]
  )

  const handleQueryChange = useCallback((value) => {
    setQuery(value)
  }, [])

  const handleBoatTypeChange = useCallback((value) => {
    setBoatType(value)
  }, [])

  const handleStartDateChange = useCallback((value) => {
    setStartDate(value)
  }, [])

  const handleEndDateChange = useCallback((value) => {
    setEndDate(value)
  }, [])

  const toggleFilters = useCallback(() => {
    setFiltersOpen((currentValue) => !currentValue)
  }, [])

  const closeFilters = useCallback(() => {
    setFiltersOpen(false)
  }, [])

  return {
    query,
    setQuery: handleQueryChange,
    boatType,
    setBoatType: handleBoatTypeChange,
    startDate,
    setStartDate: handleStartDateChange,
    endDate,
    setEndDate: handleEndDateChange,
    handleSearch,
    filtersOpen,
    toggleFilters,
    closeFilters,
    isHomePage,
    hasMarketplaceSearch: isHomePage && urlState.hasMarketplaceSearch,
  }
}
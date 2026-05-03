import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

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

  const [query, setQuery] = useState(urlState.query)
  const [boatType, setBoatType] = useState(urlState.boatType)
  const [startDate, setStartDate] = useState(urlState.startDate)
  const [endDate, setEndDate] = useState(urlState.endDate)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    setQuery(urlState.query)
    setBoatType(urlState.boatType)
    setStartDate(urlState.startDate)
    setEndDate(urlState.endDate)
  }, [urlState.query, urlState.boatType, urlState.startDate, urlState.endDate])

  useEffect(() => {
    setFiltersOpen(false)
  }, [location.pathname])

  const handleSearch = useCallback((event) => {
    event.preventDefault()

    const nextParams = new URLSearchParams(isHomePage ? location.search : '')

    setParam(nextParams, 'q', query)
    setParam(nextParams, 'boat_type', boatType)
    setParam(nextParams, 'start_date', startDate)
    setParam(nextParams, 'end_date', endDate)

    nextParams.delete('page')

    const nextSearch = nextParams.toString()
    navigate(nextSearch ? `/?${nextSearch}` : '/')
  }, [boatType, endDate, isHomePage, location.search, navigate, query, startDate])

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
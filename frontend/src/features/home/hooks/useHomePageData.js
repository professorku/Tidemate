import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  buildSearchParamsFromFilters,
  getFiltersFromSearchParams,
  getListingsPage,
  initialHomeFilters,
} from '../utils/listingSearchParams'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'

const EMPTY_PAGINATION = {
  count: 0,
  page: 1,
  totalPages: 1,
  next: null,
  previous: null,
}

export default function useHomePageData() {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const paramsKey = searchParams.toString()

  const derivedFilters = useMemo(
    () => getFiltersFromSearchParams(searchParams),
    [searchParams]
  )

  const [filters, setFiltersState] = useState(derivedFilters)

  useEffect(() => {
    setFiltersState(derivedFilters)
  }, [derivedFilters])

  const setFilters = useCallback((nextFilters) => {
    setFiltersState((currentFilters) => {
      if (typeof nextFilters === 'function') {
        return nextFilters(currentFilters)
      }

      return nextFilters
    })
  }, [])

  const boatsQuery = useQuery({
    queryKey: queryKeys.listings.page(paramsKey),
    queryFn: async () => {
      const page = Number(searchParams.get('page') || 1)
      return getListingsPage(searchParams, page)
    },
  })

  const error = boatsQuery.error
    ? getErrorMessage(boatsQuery.error, 'Could not load boats right now.')
    : ''

  useEffect(() => {
    if (!error) return
    showToast({ tone: 'error', message: error })
  }, [error, showToast])

  const handleApply = () => {
    const nextParams = buildSearchParamsFromFilters(filters)
    setSearchParams(nextParams)
  }

  const handleClear = () => {
    setFiltersState(initialHomeFilters)
    setSearchParams({})
  }

  const setPage = (page) => {
    const nextParams = new URLSearchParams(searchParams)

    if (page <= 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(page))
    }

    setSearchParams(nextParams)
  }

  return {
    boats: boatsQuery.data?.results || [],
    error,
    loading: boatsQuery.isLoading,
    filters,
    setFilters,
    handleApply,
    handleClear,
    pagination: boatsQuery.data
      ? {
          count: boatsQuery.data.count,
          page: boatsQuery.data.page,
          totalPages: boatsQuery.data.totalPages,
          next: boatsQuery.data.next,
          previous: boatsQuery.data.previous,
        }
      : EMPTY_PAGINATION,
    setPage,
  }
}
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function useNavbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('q') || ''
  }, [location.search])

  const [query, setQuery] = useState(searchQuery)

  const syncedQuery = query === '' ? searchQuery : query

  const handleSearch = useCallback((e) => {
    e.preventDefault()

    const trimmed = syncedQuery.trim()

    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`)
      return
    }

    navigate('/')
  }, [navigate, syncedQuery])

  const handleQueryChange = useCallback((value) => {
    setQuery(value)
  }, [])

  return {
    query: syncedQuery,
    setQuery: handleQueryChange,
    handleSearch,
  }
}

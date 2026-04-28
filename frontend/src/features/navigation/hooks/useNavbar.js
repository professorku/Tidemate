import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function useNavbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('q') || ''
  }, [location.search])

  const [query, setQuery] = useState(searchQuery)

  useEffect(() => {
    setQuery(searchQuery)
  }, [searchQuery])

  const handleSearch = useCallback((e) => {
    e.preventDefault()

    const trimmed = query.trim()

    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`)
      return
    }

    navigate('/')
  }, [navigate, query])

  const handleQueryChange = useCallback((value) => {
    setQuery(value)
  }, [])

  return {
    query,
    setQuery: handleQueryChange,
    handleSearch,
  }
}
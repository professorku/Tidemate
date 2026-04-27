import { useEffect, useState } from 'react'
import { getListingConditions } from '../../api/domains/listings'

export default function useMarineConditions(boatId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadConditions = async () => {
      try {
        setLoading(true)
        setError('')
        const conditions = await getListingConditions(boatId)
        if (!cancelled) setData(conditions)
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load marine conditions right now.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (boatId) {
      loadConditions()
    } else {
      setData(null)
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [boatId])

  return { data, loading, error }
}

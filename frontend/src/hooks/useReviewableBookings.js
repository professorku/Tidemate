import { useCallback, useState } from 'react'
import { fetchMyReviewableBookings } from '../features/reviews/services/reviewableBookingsService'
import { useAuth } from '../context/useAuth'

export function useReviewableBookings() {
  const { isAuthenticated } = useAuth()
  const [reviewableBookings, setReviewableBookings] = useState([])

  const refreshReviewableBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setReviewableBookings([])
      return []
    }

    try {
      const bookings = await fetchMyReviewableBookings()
      setReviewableBookings(bookings)
      return bookings
    } catch (error) {
      setReviewableBookings([])
      throw error
    }
  }, [isAuthenticated])

  return {
    reviewableBookings,
    setReviewableBookings,
    refreshReviewableBookings,
  }
}

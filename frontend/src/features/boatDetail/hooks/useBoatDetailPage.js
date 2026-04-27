import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import { useReviewableBookings } from '../../../hooks/useReviewableBookings'
import { getBoatReviews, createEmptyReviewPage } from '../../../api/domains/reviews'
import { getListingDetail } from '../../../api/domains/listings'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'

export default function useBoatDetailPage(id) {
  const { user: currentUser, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { reviewableBookings, refreshReviewableBookings } = useReviewableBookings()

  const [boat, setBoat] = useState(null)
  const [reviewsData, setReviewsData] = useState(createEmptyReviewPage())
  const [reviewsPage, setReviewsPage] = useState(1)
  const [error, setError] = useState('')

  const loadBoat = useCallback(async () => {
    try {
      setError('')
      const nextBoat = await getListingDetail(id)
      setBoat(nextBoat)
    } catch (err) {
      console.error(err)
      const message = getErrorMessage(err, 'Could not load this boat.')
      setError(message)
      showToast({ tone: 'error', message })
    }
  }, [id])

  const loadReviews = useCallback(async (page = 1) => {
    try {
      const reviews = await getBoatReviews(id, { page })
      setReviewsData(reviews)
      setReviewsPage(page)
    } catch (err) {
      console.error(err)
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not load reviews.') })
    }
  }, [id])

  const loadReviewEligibility = useCallback(async () => {
    if (!isAuthenticated) {
      return []
    }

    try {
      return await refreshReviewableBookings()
    } catch {
      return []
    }
  }, [isAuthenticated, refreshReviewableBookings])

  useEffect(() => {
    void Promise.all([
      loadBoat(),
      loadReviews(1),
      loadReviewEligibility(),
    ])
  }, [loadBoat, loadReviews, loadReviewEligibility])

  const reviewableBooking = useMemo(() => {
    return (
      reviewableBookings.find(
        (booking) =>
          Number(booking.boat_id) === Number(id) && booking.can_review_boat === true
      ) || null
    )
  }, [id, reviewableBookings])

  const isOwner = useMemo(() => {
    return currentUser && boat && boat.host_id === currentUser.id
  }, [currentUser, boat])

  return {
    boat,
    reviewsData,
    reviewsPage,
    setReviewsPage,
    reviewableBooking,
    isOwner,
    error,
    loadBoat,
    loadReviews,
    loadReviewEligibility,
  }
}

import api from '../../../api/client'

export async function fetchMyReviewableBookings() {
  const res = await api.get('/reviews/my-reviewable-bookings/')
  return Array.isArray(res.data) ? res.data : []
}

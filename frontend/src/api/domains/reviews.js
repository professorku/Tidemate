import { apiGet, apiPost, toPaginatedData } from '../client'
import { normalizeCollection, normalizeReview } from '../../types/domain'

const EMPTY_REVIEW_PAGE = {
  average_rating: null,
  review_count: 0,
  count: 0,
  next: null,
  previous: null,
  page: 1,
  pageSize: 5,
  totalPages: 1,
  results: [],
}

export function createEmptyReviewPage() {
  return { ...EMPTY_REVIEW_PAGE }
}

export function createReview(payload) {
  return apiPost('/reviews/create/', payload)
}

export async function getBoatReviews(boatId, params) {
  const data = await apiGet(`/reviews/boats/${boatId}/`, { params })
  const page = toPaginatedData(data, { fallbackPageSize: 5 })
  return {
    ...page,
    results: normalizeCollection(page.results, normalizeReview),
    average_rating: page.average_rating,
    review_count: page.review_count,
  }
}

export async function getUserReviews(userId, params) {
  const data = await apiGet(`/reviews/users/${userId}/`, { params })
  const page = toPaginatedData(data, { fallbackPageSize: 5 })
  return {
    ...page,
    results: normalizeCollection(page.results, normalizeReview),
    average_rating: page.average_rating,
    review_count: page.review_count,
  }
}

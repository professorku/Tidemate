import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as apiClient from '../../../api/client'
import { getUserReviews } from '../../../api/domains/reviews'

describe('reviewService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('normalizes review pages', async () => {
    vi.spyOn(apiClient, 'apiGet').mockResolvedValue({
      average_rating: 4.8,
      review_count: 2,
      count: 2,
      results: [
        { id: 1, rating: 5, comment: 'Great guest' },
        { id: 2, rating: 4, comment: 'Smooth rental' },
      ],
    })

    const page = await getUserReviews(3, { page: 1 })

    expect(page.average_rating).toBe(4.8)
    expect(page.review_count).toBe(2)
    expect(page.results).toHaveLength(2)
    expect(page.results[0].comment).toBe('Great guest')
  })
})

import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as apiClient from '../../../api/client'
import { getListingDetail, listListingsPage } from '../../../api/domains/listings'

describe('listingService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('normalizes paginated listings', async () => {
    vi.spyOn(apiClient, 'apiGet').mockResolvedValue({
      count: 1,
      page: 1,
      total_pages: 1,
      results: [
        {
          id: 7,
          title: 'Aurora',
          guests: '6',
          price_per_day: '2500.00',
          images: [{ id: 1, image: '/boat.jpg', is_cover: true }],
        },
      ],
    })

    const page = await listListingsPage({ page: 1 })

    expect(page.results[0]).toMatchObject({
      id: 7,
      title: 'Aurora',
      guests: 6,
      price_per_day: 2500,
    })
    expect(page.results[0].images[0]).toMatchObject({ id: 1, is_cover: true })
  })

  it('normalizes a listing detail response', async () => {
    vi.spyOn(apiClient, 'apiGet').mockResolvedValue({
      id: 9,
      title: 'Nordlys',
      latitude: '66.31',
      longitude: '14.14',
    })

    const listing = await getListingDetail(9)

    expect(listing.latitude).toBe(66.31)
    expect(listing.longitude).toBe(14.14)
    expect(listing.title).toBe('Nordlys')
  })
})

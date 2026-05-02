import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import HomePage from './HomePage'

const listingMocks = vi.hoisted(() => ({
  listListingsPage: vi.fn(),
}))

const toastMocks = vi.hoisted(() => ({
  showToast: vi.fn(),
}))

vi.mock('../../../api/domains/listings', () => ({
  listListingsPage: listingMocks.listListingsPage,
}))

vi.mock('../../../context/useToast', () => ({
  useToast: () => ({
    showToast: toastMocks.showToast,
  }),
}))

vi.mock('../../../components/BoatCard/BoatCard', () => ({
  default: ({ boat }) => (
    <article>
      <h2>{boat.title}</h2>
      <p>{boat.location_name}</p>
      <p>{boat.price_per_day} kr</p>
    </article>
  ),
}))

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

function renderHomePage(initialEntries = ['/']) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function mockListings(results = []) {
  listingMocks.listListingsPage.mockResolvedValue({
    results,
    count: results.length,
    page: 1,
    totalPages: 1,
    next: null,
    previous: null,
  })
}

describe('HomePage boat search', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads boats using query params from the URL', async () => {
    mockListings([
      {
        id: 1,
        title: 'Oslofjord RIB',
        location_name: 'Oslo',
        price_per_day: 2500,
      },
    ])

    renderHomePage(['/?q=Oslo&min_guests=4'])

    expect(await screen.findByText('Oslofjord RIB')).not.toBeNull()

    expect(listingMocks.listListingsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'Oslo',
        min_guests: '4',
        page: 1,
      })
    )
  })

  it('applies search filters and triggers a new listing request', async () => {
    mockListings([
      {
        id: 2,
        title: 'Bodø Sailboat',
        location_name: 'Bodø',
        price_per_day: 1800,
      },
    ])

    renderHomePage()

    fireEvent.change(screen.getByLabelText(/^Search$/i), {
      target: { value: 'Bodø' },
    })

    fireEvent.change(screen.getByLabelText(/^Boat type$/i), {
      target: { value: 'sailboat' },
    })

    fireEvent.change(screen.getByLabelText(/^Min guests$/i), {
      target: { value: '3' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^apply$/i }))

    await waitFor(() => {
      expect(listingMocks.listListingsPage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          q: 'Bodø',
          boat_type: 'sailboat',
          min_guests: '3',
          page: 1,
        })
      )
    })
  })

  it('shows an empty state when no boats match the search', async () => {
    mockListings([])

    renderHomePage(['/?q=does-not-exist'])

    expect(await screen.findByText('No boats found')).not.toBeNull()
  })
})
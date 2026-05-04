import { expect, test } from '@playwright/test'

const MOCK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="sea" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0b2f4a"/>
          <stop offset="100%" stop-color="#d7b45a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#sea)"/>
      <path d="M170 300 C260 210 430 210 560 300 Z" fill="#ffffff" opacity="0.9"/>
      <path d="M235 290 L330 150 L425 290 Z" fill="#ffffff" opacity="0.95"/>
      <path d="M330 150 L330 290" stroke="#0b2f4a" stroke-width="8"/>
      <text x="400" y="390" text-anchor="middle" font-family="Arial" font-size="42" font-weight="700" fill="#ffffff">TideMate</text>
    </svg>
  `)

const MOCK_LISTINGS = [
  {
    id: 101,
    title: 'Midnight Fjord Cruiser',
    description: 'Comfortable motorboat for coastal trips.',
    boat_type: 'motorboat',
    location_name: 'Bodø',
    guests: 6,
    price_per_day: '2400.00',
    image: MOCK_IMAGE,
    thumbnail: MOCK_IMAGE,
    images: [],
    host_id: 11,
    host_name: 'Nora Host',
    is_favorited: false,
    favorite_id: null,
    exact_location_available: false,
    location_precision: 'approximate',
    location_disclosure_message: 'Exact pickup details are shared after booking.',
    created_at: '2030-01-01T12:00:00Z',
  },
  {
    id: 102,
    title: 'Oslo Sail Escape',
    description: 'A relaxed sailboat for the inner fjord.',
    boat_type: 'sailboat',
    location_name: 'Oslo',
    guests: 4,
    price_per_day: '1800.00',
    image: MOCK_IMAGE,
    thumbnail: MOCK_IMAGE,
    images: [],
    host_id: 12,
    host_name: 'Sindre Sailor',
    is_favorited: true,
    favorite_id: 501,
    exact_location_available: false,
    location_precision: 'approximate',
    location_disclosure_message: 'Exact pickup details are shared after booking.',
    created_at: '2030-01-02T12:00:00Z',
  },
]

function paginatedListings(results = MOCK_LISTINGS) {
  return {
    count: results.length,
    next: null,
    previous: null,
    page: 1,
    page_size: 16,
    total_pages: 1,
    results,
  }
}

async function mockAnonymousApi(page, { onListingsRequest } = {}) {
  await page.route('**/api/users/csrf/', async (route) => {
    await route.fulfill({
      status: 204,
      headers: {
        'set-cookie': 'csrftoken=e2e-csrf-token; Path=/; SameSite=Lax',
      },
    })
  })

  await page.route('**/api/users/refresh/', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'No active session.' }),
    })
  })

  await page.route('**/api/users/me/', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Authentication credentials were not provided.' }),
    })
  })

  await page.route('**/api/listings/**', async (route) => {
    const url = new URL(route.request().url())
    onListingsRequest?.(url)

    if (url.pathname.match(/\/api\/listings\/\d+\/conditions\/?$/)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true, warnings: [] }),
      })
      return
    }

    const detailMatch = url.pathname.match(/\/api\/listings\/(\d+)\/?$/)

    if (detailMatch) {
      const listing = MOCK_LISTINGS.find((item) => String(item.id) === detailMatch[1])

      await route.fulfill({
        status: listing ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(listing || { detail: 'Not found.' }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paginatedListings()),
    })
  })
}

test('homepage renders real listing cards from the API', async ({ page }) => {
  await mockAnonymousApi(page)

  await page.goto('/')

  await expect(page).toHaveTitle(/Tidemate|Boat|Rental|Rent/i)
  await expect(page.getByRole('link', { name: /view midnight fjord cruiser/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /view oslo sail escape/i })).toBeVisible()
  await expect(page.getByText('Bodø').first()).toBeVisible()
})

test('desktop marketplace search updates the URL and API params', async ({ page }) => {
  const listingRequests = []
  await mockAnonymousApi(page, {
    onListingsRequest: (url) => listingRequests.push(url),
  })

  await page.goto('/')

  await page.getByPlaceholder('Where are you going?').fill('Bodø')
  await expect(page).toHaveURL(/q=Bod%C3%B8/)

  await page.locator('#navbar-boat-type').selectOption('motorboat')
  await expect(page).toHaveURL(/boat_type=motorboat/)

  await expect.poll(() => {
    return listingRequests.some((url) => {
      return (
        url.searchParams.get('q') === 'Bodø' &&
        url.searchParams.get('boat_type') === 'motorboat'
      )
    })
  }).toBe(true)
})

test('desktop advanced filters can be opened before an active search', async ({ page }) => {
  await mockAnonymousApi(page)

  await page.goto('/')

  await page.getByPlaceholder('Where are you going?').click()
  await page.getByRole('button', { name: /filters/i }).click()
  await page.getByLabel('Guests', { exact: true }).fill('4')
  await page.getByRole('button', { name: /^apply$/i }).click()

  await expect(page).toHaveURL(/min_guests=4/)
})

test('mobile search drawer applies keyword, type, dates, guests, and price filters', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  const listingRequests = []
  await mockAnonymousApi(page, {
    onListingsRequest: (url) => listingRequests.push(url),
  })

  await page.goto('/')

  await expect(page.getByTestId('mobile-search-trigger')).toBeVisible()
  await page.getByTestId('mobile-search-trigger').click()
  await expect(page.getByTestId('mobile-search-drawer')).toBeVisible()

  await page.getByLabel('Search location or boat').fill('Oslo')
  await page.locator('#mobile-boat-type').selectOption('sailboat')
  await page.getByLabel('Pickup date').fill('2030-06-10')
  await page.getByLabel('Return date').fill('2030-06-12')
  await page.getByLabel('Minimum guests').fill('3')
  await page.getByLabel('Min price').fill('1000')
  await page.getByLabel('Max price').fill('3000')
  await page.getByRole('button', { name: /show boats/i }).click()

  await expect(page).toHaveURL(/q=Oslo/)
  await expect(page).toHaveURL(/boat_type=sailboat/)
  await expect(page).toHaveURL(/start_date=2030-06-10/)
  await expect(page).toHaveURL(/end_date=2030-06-12/)
  await expect(page).toHaveURL(/min_guests=3/)
  await expect(page).toHaveURL(/min_price=1000/)
  await expect(page).toHaveURL(/max_price=3000/)

  await expect.poll(() => {
    return listingRequests.some((url) => {
      return (
        url.searchParams.get('q') === 'Oslo' &&
        url.searchParams.get('boat_type') === 'sailboat' &&
        url.searchParams.get('start_date') === '2030-06-10' &&
        url.searchParams.get('end_date') === '2030-06-12' &&
        url.searchParams.get('min_guests') === '3' &&
        url.searchParams.get('min_price') === '1000' &&
        url.searchParams.get('max_price') === '3000'
      )
    })
  }).toBe(true)
})

test('protected pages redirect anonymous users to login', async ({ page }) => {
  await mockAnonymousApi(page)

  await page.goto('/favorites')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible()
})
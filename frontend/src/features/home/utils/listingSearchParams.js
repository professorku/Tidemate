import { listListingsPage } from '../../../api/domains/listings'

export const HOME_LISTINGS_PAGE_SIZE = 16

export const initialHomeFilters = {
  q: '',
  start_date: '',
  end_date: '',
  boat_type: '',
  min_guests: '',
  min_price: '',
  max_price: '',
}

function hasCompleteDateRange(startDate, endDate) {
  return Boolean(startDate && endDate && endDate > startDate)
}

function cleanFilterValue(value) {
  return String(value || '').trim()
}

export function normalizeHomeFilters(filters) {
  const normalizedFilters = {
    q: cleanFilterValue(filters.q),
    start_date: cleanFilterValue(filters.start_date),
    end_date: cleanFilterValue(filters.end_date),
    boat_type: cleanFilterValue(filters.boat_type),
    min_guests: cleanFilterValue(filters.min_guests),
    min_price: cleanFilterValue(filters.min_price),
    max_price: cleanFilterValue(filters.max_price),
  }

  if (
    !hasCompleteDateRange(
      normalizedFilters.start_date,
      normalizedFilters.end_date
    )
  ) {
    normalizedFilters.start_date = ''
    normalizedFilters.end_date = ''
  }

  return normalizedFilters
}

export function getFiltersFromSearchParams(searchParams) {
  return normalizeHomeFilters({
    q: searchParams.get('q') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
    boat_type: searchParams.get('boat_type') || '',
    min_guests: searchParams.get('min_guests') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
  })
}

export function buildSearchParamsFromFilters(filters) {
  const params = {}
  const normalizedFilters = normalizeHomeFilters(filters)

  Object.entries(normalizedFilters).forEach(([key, value]) => {
    if (value !== '') {
      params[key] = value
    }
  })

  return params
}

export async function getListingsPage(searchParams, page = 1) {
  const filters = getFiltersFromSearchParams(searchParams)

  const params = {
    ...buildSearchParamsFromFilters(filters),
    page,
    page_size: HOME_LISTINGS_PAGE_SIZE,
  }

  return listListingsPage(params)
}
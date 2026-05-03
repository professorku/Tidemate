import { listListingsPage } from '../../../api/domains/listings'

export const initialHomeFilters = {
  q: '',
  start_date: '',
  end_date: '',
  boat_type: '',
  min_guests: '',
  min_price: '',
  max_price: '',
}

export function getFiltersFromSearchParams(searchParams) {
  return {
    q: searchParams.get('q') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
    boat_type: searchParams.get('boat_type') || '',
    min_guests: searchParams.get('min_guests') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
  }
}

export function buildSearchParamsFromFilters(filters) {
  const params = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '') {
      params[key] = value
    }
  })

  return params
}

export async function getListingsPage(searchParams, page = 1) {
  const params = {
    ...Object.fromEntries(searchParams.entries()),
    page,
  }

  return listListingsPage(params)
}
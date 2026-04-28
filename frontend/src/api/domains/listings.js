import { apiDelete, apiGet, apiPost, apiPut, toPaginatedData, toResultsArray } from '../client'
import { normalizeCollection, normalizeListing } from '../../types/domain'

const HOST_LISTINGS_PAGE_SIZE = 48

export function listListings(params) {
  return apiGet('/listings/', { params })
}

export async function listListingsPage(params) {
  const data = await listListings(params)
  const page = toPaginatedData(data, { fallbackPageSize: 12 })

  return {
    ...page,
    results: normalizeCollection(page.results, normalizeListing),
  }
}

export async function getListingDetail(listingId) {
  const data = await apiGet(`/listings/${listingId}/`)
  return normalizeListing(data)
}

export function getListingConditions(listingId) {
  return apiGet(`/listings/${listingId}/conditions/`)
}

export async function getListingsByHost(hostId, params = {}) {
  const normalizedHostId = Number(hostId)

  if (!Number.isInteger(normalizedHostId) || normalizedHostId <= 0) {
    return []
  }

  const {
    page,
    page_size,
    pageSize,
    ...restParams
  } = params || {}

  const requestedPageSize = Number(page_size || pageSize || HOST_LISTINGS_PAGE_SIZE)
  const safePageSize =
    Number.isInteger(requestedPageSize) && requestedPageSize > 0
      ? Math.min(requestedPageSize, HOST_LISTINGS_PAGE_SIZE)
      : HOST_LISTINGS_PAGE_SIZE

  let currentPage = Number(page || 1)

  if (!Number.isInteger(currentPage) || currentPage <= 0) {
    currentPage = 1
  }

  const results = []
  let hasNext = true

  while (hasNext) {
    const data = await listListings({
      ...restParams,
      host_id: normalizedHostId,
      page: currentPage,
      page_size: safePageSize,
    })

    const pageData = toPaginatedData(data, { fallbackPageSize: safePageSize })
    results.push(...pageData.results)

    hasNext = Boolean(pageData.hasNext)
    currentPage += 1
  }

  return normalizeCollection(results, normalizeListing)
}

export async function getNearbyListings({ latitude, longitude, excludeId, radiusKm = 25, page = 1, pageSize = 6 }) {
  const listings = await listListings({
    latitude,
    longitude,
    radius_km: radiusKm,
    exclude_id: excludeId,
    page,
    page_size: pageSize,
  })

  return normalizeCollection(toResultsArray(listings), normalizeListing)
}

export async function listMyListingsPage(params) {
  const listings = await apiGet('/listings/mine/', { params })
  const page = toPaginatedData(listings, { fallbackPageSize: 12 })

  return {
    ...page,
    results: normalizeCollection(page.results, normalizeListing),
  }
}

export async function listMyListings() {
  const listings = await apiGet('/listings/mine/')
  return normalizeCollection(toResultsArray(listings), normalizeListing)
}

export async function getMyListingDetail(listingId) {
  const data = await apiGet(`/listings/mine/${listingId}/`)
  return normalizeListing(data)
}

export function createListing(data, config) {
  return apiPost('/listings/', data, config)
}

export function updateMyListing(listingId, data, config) {
  return apiPut(`/listings/mine/${listingId}/`, data, config)
}

export function deleteMyListing(listingId) {
  return apiDelete(`/listings/mine/${listingId}/`)
}
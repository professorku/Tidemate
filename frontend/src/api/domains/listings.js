import { apiDelete, apiGet, apiPost, apiPut, toPaginatedData, toResultsArray } from '../client'
import { normalizeCollection, normalizeListing } from '../../types/domain'

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

export async function getListingsByHost(hostId, params) {
  const listings = await listListings(params)
  return normalizeCollection(
    toResultsArray(listings).filter((listing) => Number(listing.host_id) === Number(hostId)),
    normalizeListing
  )
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

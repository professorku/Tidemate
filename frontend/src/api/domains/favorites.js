import { apiDelete, apiGet, apiPost, toPaginatedData } from '../client'
import { normalizeCollection, normalizeListing } from '../../types/domain'

export async function getFavoritesPage(params) {
  const data = await apiGet('/favorites/', { params })
  const page = toPaginatedData(data, { fallbackPageSize: 9 })
  const boats = normalizeCollection(
    page.results.map((favorite) => favorite?.boat).filter(Boolean),
    normalizeListing
  )

  return {
    ...page,
    boats,
  }
}

export function createFavorite(boatId) {
  return apiPost('/favorites/', { boat_id: boatId })
}

export function deleteFavorite(favoriteId) {
  return apiDelete(`/favorites/${favoriteId}/`)
}

export function removeBoatFromFavoritesList(boats, boatId) {
  return boats.filter((boat) => boat.id !== boatId)
}

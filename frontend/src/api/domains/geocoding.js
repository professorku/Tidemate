import { apiGet, toResultsArray } from '../client'

export async function searchGeocodingPlaces(query, config = {}) {
  const trimmed = String(query || '').trim()

  if (trimmed.length < 2) {
    return []
  }

  const data = await apiGet('/geocoding/search/', {
    ...config,
    params: {
      ...(config.params || {}),
      q: trimmed,
    },
  })

  return toResultsArray(data)
}

export function reverseGeocodeLocation({ latitude, longitude }, config = {}) {
  return apiGet('/geocoding/reverse/', {
    ...config,
    params: {
      ...(config.params || {}),
      lat: latitude,
      lon: longitude,
    },
  })
}
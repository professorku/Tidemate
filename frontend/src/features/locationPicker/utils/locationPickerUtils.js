export function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || ''
}

export function normalizeLocationName(result) {
  if (!result) return ''

  const address = result.address || {}

  // Privacy rule:
  // location_name must be public city/area only, never exact road/dock/address.
  return firstNonEmpty(
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
    address.state,
    result.name,
    address.country
  )
}
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

  // Important:
  // Do NOT use result.display_name here.
  // display_name often contains exact house number, road, marina, postcode, etc.
  return firstNonEmpty(
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.county,
    address.state,
    address.region,
    address.country
  )
}
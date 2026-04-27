export function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function normalizeLocationName(result) {
  if (!result) return ''
  return (
    result.display_name ||
    result.name ||
    result.address?.city ||
    result.address?.town ||
    result.address?.village ||
    ''
  )
}
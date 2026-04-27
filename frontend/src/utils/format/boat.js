export function formatBoatType(value) {
  if (!value) return 'Boat'

  return value
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const PRIVATE_ADDRESS_WORDS = [
  'gate',
  'gata',
  'gaten',
  'vei',
  'veien',
  'veg',
  'vegen',
  'road',
  'street',
  'avenue',
  'dock',
  'pier',
  'slip',
  'marina',
  'brygge',
  'kai',
  'havn',
  'harbor',
  'harbour',
]

const COUNTRY_NAMES = ['norway', 'norge']

function cleanPart(value) {
  return String(value || '').trim().replace(/^,+|,+$/g, '')
}

function partLooksPrivate(value) {
  const part = cleanPart(value)
  const lower = part.toLowerCase()

  if (!part) return true
  if (COUNTRY_NAMES.includes(lower)) return true
  if (/^\d+$/.test(lower)) return true
  if (/\b\d{4}\b/.test(lower)) return true
  if (part.length <= 1) return true

  return PRIVATE_ADDRESS_WORDS.some((word) => {
    return new RegExp(`\\b${word}\\b`, 'i').test(lower)
  })
}

export function getPublicLocationLabel(value, fallback = 'Approximate area') {
  const raw = String(value || '').trim()
  if (!raw) return fallback

  const parts = raw
    .split(',')
    .map(cleanPart)
    .filter(Boolean)

  if (parts.length === 0) return fallback

  let preferredParts

  if (parts.length >= 5) {
    preferredParts = parts.slice(2, 4)
  } else if (parts.length === 4) {
    preferredParts = parts.slice(1, 3)
  } else {
    preferredParts = parts.slice(0, 2)
  }

  let safeParts = preferredParts.filter((part) => !partLooksPrivate(part))

  if (safeParts.length === 0) {
    safeParts = parts.filter((part) => !partLooksPrivate(part))
  }

  if (safeParts.length === 0) return fallback

  return safeParts.slice(0, 2).join(', ')
}

export function canShowExactLocation(entity) {
  return Boolean(entity?.exact_location_available) || entity?.location_precision === 'exact'
}

export function getRawPublicLocation(entity) {
  return entity?.location_name || entity?.boat_location || ''
}

export function getBoatLocationLabel(entity, fallback = 'Approximate area') {
  if (!entity) return fallback

  if (canShowExactLocation(entity)) {
    return (
      entity.pickup_address ||
      entity.exact_location_name ||
      entity.location_name ||
      entity.boat_location ||
      fallback
    )
  }

  return getPublicLocationLabel(getRawPublicLocation(entity), fallback)
}

export function getBoatPublicLocationLabel(entity, fallback = 'Approximate area') {
  return getPublicLocationLabel(getRawPublicLocation(entity), fallback)
}

export function getBoatLocationSubtitle(entity) {
  if (!entity) return ''

  if (canShowExactLocation(entity)) {
    return entity.pickup_instructions || entity.location_disclosure_message || ''
  }

  return entity.location_disclosure_message || 'Exact pickup location is shared after booking confirmation.'
}
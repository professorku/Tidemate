export function safeInternalPath(path, fallback = '/notifications') {
  if (!path || typeof path !== 'string') return fallback

  const trimmedPath = path.trim()

  if (!trimmedPath.startsWith('/')) return fallback
  if (trimmedPath.startsWith('//')) return fallback
  if (trimmedPath.includes('\\')) return fallback

  return trimmedPath
}
const SESSION_HINT_KEY = 'tidemate:session-hint'
const SESSION_CHANGE_EVENT = 'tidemate:session-change'

let sessionHintActive = false

function canUseWindow() {
  return typeof window !== 'undefined'
}

function canUseStorage() {
  return canUseWindow() && typeof window.localStorage !== 'undefined'
}

function readStoredSessionHint() {
  if (!canUseStorage()) {
    return false
  }

  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === '1'
  } catch {
    return false
  }
}

function writeStoredSessionHint(isActive) {
  if (!canUseStorage()) {
    return
  }

  try {
    if (isActive) {
      window.localStorage.setItem(SESSION_HINT_KEY, '1')
    } else {
      window.localStorage.removeItem(SESSION_HINT_KEY)
    }
  } catch {
    // Ignore storage access issues and fall back to in-memory state only.
  }
}

function emitSessionChange(isActive) {
  if (!canUseWindow() || typeof window.dispatchEvent !== 'function') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(SESSION_CHANGE_EVENT, {
      detail: {
        isActive,
      },
    })
  )
}

export function hasSessionHint() {
  return sessionHintActive || readStoredSessionHint()
}

export function markSessionHintActive() {
  sessionHintActive = true
  writeStoredSessionHint(true)
  emitSessionChange(true)
}

export function clearSessionHint() {
  sessionHintActive = false
  writeStoredSessionHint(false)
  emitSessionChange(false)
}

export function subscribeToSessionHintChanges(listener) {
  if (!canUseWindow() || typeof window.addEventListener !== 'function') {
    return () => {}
  }

  const handleSessionChange = (event) => {
    listener(Boolean(event.detail?.isActive))
  }

  const handleStorageChange = (event) => {
    if (event.key === SESSION_HINT_KEY) {
      sessionHintActive = event.newValue === '1'
      listener(sessionHintActive)
    }
  }

  window.addEventListener(SESSION_CHANGE_EVENT, handleSessionChange)
  window.addEventListener('storage', handleStorageChange)

  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}

// Backwards-compatible helper for old code paths only.
// Do not use this for real authorization decisions. The server-confirmed
// AuthContext state is the source of truth.
export function isAuthenticated() {
  return hasSessionHint()
}
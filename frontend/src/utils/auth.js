const SESSION_HINT_KEY = 'tidemate:session-hint'

let sessionHintActive = false

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
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

export function hasSessionHint() {
  return sessionHintActive || readStoredSessionHint()
}

export function markSessionHintActive() {
  sessionHintActive = true
  writeStoredSessionHint(true)
}

export function clearSessionHint() {
  sessionHintActive = false
  writeStoredSessionHint(false)
}

export function isAuthenticated() {
  return hasSessionHint()
}

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clearSessionHint, hasSessionHint, markSessionHintActive } from '../utils/auth'
import { fetchCurrentUser } from '../api/domains/users'
import { logoutUser, refreshSession } from '../features/auth/services/authService'

const AuthContext = createContext(null)

export default AuthContext

const SESSION_STATUS = {
  INITIALIZING: 'initializing',
  AUTHENTICATED: 'authenticated',
  ANONYMOUS: 'anonymous',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionStatus, setSessionStatus] = useState(SESSION_STATUS.INITIALIZING)
  const bootstrapRef = useRef(false)

  const clearSession = useCallback(() => {
    clearSessionHint()
    setUser(null)
    setSessionStatus(SESSION_STATUS.ANONYMOUS)
  }, [])

  const establishSession = useCallback(async () => {
    const currentUser = await fetchCurrentUser()
    setUser(currentUser)
    setSessionStatus(SESSION_STATUS.AUTHENTICATED)
    return currentUser
  }, [])

  const bootstrapSession = useCallback(async () => {
    setLoading(true)

    try {
      if (hasSessionHint()) {
        await refreshSession()
        markSessionHintActive()
      }

      await establishSession()
    } catch {
      clearSession()
    } finally {
      setLoading(false)
    }
  }, [clearSession, establishSession])

  useEffect(() => {
    if (bootstrapRef.current) {
      return
    }

    bootstrapRef.current = true
    void bootstrapSession()
  }, [bootstrapSession])

  const refreshUser = useCallback(async () => {
    try {
      return await establishSession()
    } catch {
      clearSession()
      return null
    }
  }, [clearSession, establishSession])

  const login = useCallback(async () => {
    setLoading(true)

    try {
      markSessionHintActive()
      await establishSession()
    } catch {
      clearSession()
      throw new Error('Unable to restore your session.')
    } finally {
      setLoading(false)
    }
  }, [clearSession, establishSession])

  const logout = useCallback(async () => {
    setLoading(true)

    try {
      await logoutUser()
    } catch {
      // Clear local auth state even if the server-side logout request fails.
    } finally {
      clearSession()
      setLoading(false)
    }
  }, [clearSession])

  const expireSession = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      isAuthenticated: sessionStatus === SESSION_STATUS.AUTHENTICATED,
      isAuthReady: sessionStatus !== SESSION_STATUS.INITIALIZING,
      sessionStatus,
      login,
      logout,
      expireSession,
      refreshUser,
      bootstrapSession,
    }),
    [user, loading, sessionStatus, login, logout, expireSession, refreshUser, bootstrapSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

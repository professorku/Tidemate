import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { clearSessionHint, markSessionHintActive } from '../utils/auth'
import { fetchCurrentUser } from '../api/domains/users'
import { logoutUser, refreshSession } from '../features/auth/services/authService'

vi.mock('../api/domains/users', () => ({
  fetchCurrentUser: vi.fn(),
}))

vi.mock('../features/auth/services/authService', () => ({
  logoutUser: vi.fn(),
  refreshSession: vi.fn(),
}))

function AuthStateProbe() {
  const auth = useAuth()

  return (
    <div>
      <p data-testid="session-status">{auth.sessionStatus}</p>
      <p data-testid="loading">{String(auth.loading)}</p>
      <p data-testid="authenticated">{String(auth.isAuthenticated)}</p>
      <p data-testid="username">{auth.user?.username || 'none'}</p>

      <button type="button" onClick={() => auth.refreshUser()}>
        Refresh user
      </button>

      <button type="button" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  )
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthStateProbe />
    </AuthProvider>
  )
}

describe('AuthProvider auth and error handling', () => {
  beforeEach(() => {
    window.localStorage.clear()
    clearSessionHint()

    fetchCurrentUser.mockReset()
    refreshSession.mockReset()
    logoutUser.mockReset()
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    clearSessionHint()
  })

  it('refreshes the session and loads the current user when a session hint exists', async () => {
    markSessionHintActive()

    refreshSession.mockResolvedValue({
      detail: 'refreshed',
    })

    fetchCurrentUser.mockResolvedValue({
      id: 1,
      username: 'jens',
    })

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('authenticated')
    })

    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(fetchCurrentUser).toHaveBeenCalledTimes(1)

    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(screen.getByTestId('username').textContent).toBe('jens')
    expect(window.localStorage.getItem('tidemate:session-hint')).toBe('1')
  })

  it('clears auth state when bootstrap refresh fails', async () => {
    markSessionHintActive()

    refreshSession.mockRejectedValue(new Error('Refresh failed'))

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('anonymous')
    })

    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(fetchCurrentUser).not.toHaveBeenCalled()

    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('username').textContent).toBe('none')
    expect(window.localStorage.getItem('tidemate:session-hint')).toBeNull()
  })

  it('clears local auth state even if server logout fails', async () => {
    markSessionHintActive()

    refreshSession.mockResolvedValue({
      detail: 'refreshed',
    })

    fetchCurrentUser.mockResolvedValue({
      id: 1,
      username: 'jens',
    })

    logoutUser.mockRejectedValue(new Error('Server logout failed'))

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('authenticated')
    })

    fireEvent.click(screen.getByText('Logout'))

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('anonymous')
    })

    expect(logoutUser).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('username').textContent).toBe('none')
    expect(window.localStorage.getItem('tidemate:session-hint')).toBeNull()
  })

  it('clears auth state when refreshUser cannot fetch the current user', async () => {
    refreshSession.mockResolvedValue({
      detail: 'refreshed',
    })

    fetchCurrentUser
      .mockResolvedValueOnce({
        id: 1,
        username: 'jens',
      })
      .mockRejectedValueOnce(new Error('Session expired'))

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('authenticated')
    })

    fireEvent.click(screen.getByText('Refresh user'))

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('anonymous')
    })

    expect(fetchCurrentUser).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('username').textContent).toBe('none')
  })
})
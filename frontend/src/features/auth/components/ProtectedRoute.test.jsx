import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../../context/useAuth'

function LoginStateProbe() {
  const location = useLocation()
  return <div>Redirected from {location.state?.from?.pathname || 'unknown'}</div>
}

describe('ProtectedRoute', () => {
  it('renders a loading state while auth is bootstrapping', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true })

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <ProtectedRoute>
          <div>Private page</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText(/Checking your session/i)).not.toBeNull()
  })

  it('redirects guests to login', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false })

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Private page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login page')).not.toBeNull()
  })

  it('preserves the attempted protected route in redirect state', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false })

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Private page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginStateProbe />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Redirected from /profile')).not.toBeNull()
  })

  it('renders protected content for authenticated users', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Private page</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Private page')).not.toBeNull()
  })
})
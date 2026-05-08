import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './LoginPage'

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
}))

const serviceMocks = vi.hoisted(() => ({
  loginUser: vi.fn(),
  loginWithGoogle: vi.fn(),
  resendVerificationEmail: vi.fn(),
}))

vi.mock('../../../context/useAuth', () => ({
  useAuth: () => ({
    login: authMocks.login,
  }),
}))

vi.mock('../services/authService', () => ({
  loginUser: serviceMocks.loginUser,
  loginWithGoogle: serviceMocks.loginWithGoogle,
  resendVerificationEmail: serviceMocks.resendVerificationEmail,
}))

function renderLoginPage(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/profile" element={<div>Profile page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('logs in and redirects back to the page the user tried to open', async () => {
    serviceMocks.loginUser.mockResolvedValue({ detail: 'Logged in.' })
    authMocks.login.mockResolvedValue({ id: 1, username: 'jens' })

    renderLoginPage([
      {
        pathname: '/login',
        state: {
          from: {
            pathname: '/profile',
          },
        },
      },
    ])

    fireEvent.change(screen.getByLabelText(/^Username$/i), {
      target: { value: 'jens' },
    })

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'correct-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }))

    await waitFor(() => {
      expect(serviceMocks.loginUser).toHaveBeenCalledWith(
        {
          username: 'jens',
          password: 'correct-password',
        },
        ''
      )
    })

    expect(authMocks.login).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Profile page')).not.toBeNull()
  })

  it('shows an API error when login fails', async () => {
    serviceMocks.loginUser.mockRejectedValue({
      data: {
        detail: 'Invalid username or password.',
      },
    })

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/^Username$/i), {
      target: { value: 'jens' },
    })

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'wrong-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }))

    expect(await screen.findByText('Invalid username or password.')).not.toBeNull()
    expect(authMocks.login).not.toHaveBeenCalled()
  })
})
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import UserMenu from './UserMenu'

const authMock = vi.hoisted(() => ({
  user: {
    username: 'jens',
    stats: {
      boats_listed: 1,
    },
  },
  logout: vi.fn(),
}))

vi.mock('../../../context/useAuth', () => ({
  useAuth: () => authMock,
}))

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="current-path">{location.pathname}</p>
}

describe('UserMenu', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('opens the authenticated menu and logs the user out', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <UserMenu />
        <LocationProbe />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /menu/i }))

    expect(screen.getByText("jens's profile")).not.toBeNull()
    expect(screen.getByText('Host bookings')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /log out/i }))

    expect(authMock.logout).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('current-path').textContent).toBe('/')
  })
})
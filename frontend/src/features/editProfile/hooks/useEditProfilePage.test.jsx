import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import useEditProfilePage from './useEditProfilePage'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../services/editProfileService', async () => {
  const actual = await vi.importActual('../services/editProfileService')

  return {
    ...actual,
    getMyProfile: vi.fn(),
    updateMyProfile: vi.fn(),
  }
})

import { useAuth } from '../../../context/useAuth'
import { getMyProfile, updateMyProfile } from '../services/editProfileService'

const currentUser = {
  id: 1,
  username: 'jens',
  email: 'jens@example.com',
  location: 'Mo i Rana',
  bio: 'Boat enthusiast.',
  avatar: null,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

function submitEvent() {
  return {
    preventDefault: vi.fn(),
    persist: vi.fn(),
  }
}

describe('useEditProfilePage', () => {
  let setUserMock

  beforeEach(() => {
    navigateMock.mockReset()
    getMyProfile.mockReset()
    updateMyProfile.mockReset()

    setUserMock = vi.fn()

    useAuth.mockReset()
    useAuth.mockReturnValue({
      user: currentUser,
      setUser: setUserMock,
    })
  })

  it('updates profile fields and syncs the authenticated user', async () => {
    const updatedProfile = {
      ...currentUser,
      location: 'Bodø',
      bio: 'I rent out boats around Northern Norway.',
    }

    updateMyProfile.mockResolvedValue(updatedProfile)

    const { result } = renderHook(() => useEditProfilePage(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.formMethods.setValue('location', 'Bodø')
      result.current.formMethods.setValue('bio', 'I rent out boats around Northern Norway.')
    })

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    expect(updateMyProfile).toHaveBeenCalledWith({
      display_name: 'jens',
      email: 'jens@example.com',
      current_password: '',
      location: 'Bodø',
      bio: 'I rent out boats around Northern Norway.',
      avatar_upload: null,
    })

    expect(setUserMock).toHaveBeenCalledWith(updatedProfile)

    await waitFor(() => {
      expect(result.current.success).toBe('Profile updated successfully.')
    })
  })

  it('shows a verification message when an email change is pending', async () => {
    const updatedProfile = {
      ...currentUser,
      email: 'jens@example.com',
      pending_email: 'new-jens@example.com',
      email_change_pending: true,
    }

    updateMyProfile.mockResolvedValue(updatedProfile)

    const { result } = renderHook(() => useEditProfilePage(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.formMethods.setValue('email', 'new-jens@example.com')
      result.current.formMethods.setValue('current_password', 'correct-password')
    })

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    expect(updateMyProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new-jens@example.com',
        current_password: 'correct-password',
      })
    )

    await waitFor(() => {
      expect(result.current.success).toBe(
        'Profile updated. Check your new email address to confirm the email change.'
      )
    })
  })

  it('loads the profile from the API when auth context has no user yet', async () => {
    useAuth.mockReturnValue({
      user: null,
      setUser: setUserMock,
    })

    getMyProfile.mockResolvedValue(currentUser)

    const { result } = renderHook(() => useEditProfilePage(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(getMyProfile).toHaveBeenCalledTimes(1)
    expect(result.current.preview.email).toBe('jens@example.com')
  })

  it('navigates back to profile when cancel is used', async () => {
    const { result } = renderHook(() => useEditProfilePage(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.handleCancel()
    })

    expect(navigateMock).toHaveBeenCalledWith('/profile')
  })
})
import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBookingForm } from './useBookingForm'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../../../api/domains/bookings', () => ({
  createBooking: vi.fn(),
}))

vi.mock('../../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { createBooking } from '../../../api/domains/bookings'
import { useAuth } from '../../../context/useAuth'

const boat = {
  id: 7,
  price_per_day: 2000,
  blocked_ranges: [
    {
      start_date: '2026-06-10',
      end_date: '2026-06-12',
      status: 'approved',
    },
  ],
}

describe('useBookingForm', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    createBooking.mockReset()
    createBooking.mockResolvedValue({ id: 55 })

    useAuth.mockReset()
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAuthReady: true,
    })
  })

  it('redirects unauthenticated users to login', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isAuthReady: true,
    })

    const { result } = renderHook(() => useBookingForm({ boat }))

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(navigateMock).toHaveBeenCalledWith('/login')
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('blocks submission while auth is not ready', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isAuthReady: false,
    })

    const { result } = renderHook(() => useBookingForm({ boat }))

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(result.current.error).toBe('Please wait while we check your session.')
    expect(navigateMock).not.toHaveBeenCalled()
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('requires both pickup and return dates', async () => {
    const { result } = renderHook(() => useBookingForm({ boat }))

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(result.current.error).toBe('Please choose both a pickup date and a return date.')
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('blocks overlapping date selections', async () => {
    const { result } = renderHook(() => useBookingForm({ boat }))

    act(() => {
      result.current.handleDateClick('2026-06-11')
    })

    act(() => {
      result.current.handleDateClick('2026-06-13')
    })

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(result.current.error).toMatch(/unavailable days/i)
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('blocks same-day return selections', async () => {
    const { result } = renderHook(() => useBookingForm({ boat }))

    act(() => {
      result.current.handleDateClick('2026-06-14')
    })

    act(() => {
      result.current.handleDateClick('2026-06-14')
    })

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(result.current.error).toMatch(/return date must be after/i)
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('creates a booking and resets the form on success', async () => {
    const onBookingCreated = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useBookingForm({ boat, onBookingCreated }))

    act(() => {
      result.current.handleDateClick('2026-06-14')
    })

    act(() => {
      result.current.handleDateClick('2026-06-16')
    })

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(createBooking).toHaveBeenCalledWith({
      boat: 7,
      start_date: '2026-06-14',
      end_date: '2026-06-16',
    })

    await waitFor(() => {
      expect(result.current.success).toMatch(/booking request sent/i)
    })

    expect(onBookingCreated).toHaveBeenCalledTimes(1)
    expect(result.current.form).toEqual({
      start_date: '',
      end_date: '',
    })
  })

  it('shows the backend error when booking creation fails', async () => {
    createBooking.mockRejectedValue({
      data: {
        detail: 'Selected dates are no longer available.',
      },
    })

    const { result } = renderHook(() => useBookingForm({ boat }))

    act(() => {
      result.current.handleDateClick('2026-06-14')
    })

    act(() => {
      result.current.handleDateClick('2026-06-16')
    })

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(createBooking).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBe('Selected dates are no longer available.')
  })
})
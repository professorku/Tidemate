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

vi.mock('../../../utils/auth', () => ({
  isAuthenticated: vi.fn(),
}))

import { createBooking } from '../../../api/domains/bookings'
import { isAuthenticated } from '../../../utils/auth'

const boat = {
  id: 7,
  price_per_day: 2000,
  blocked_ranges: [{ start_date: '2026-06-10', end_date: '2026-06-12', status: 'approved' }],
}

describe('useBookingForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    navigateMock.mockReset()
    createBooking.mockResolvedValue({ id: 55 })
    isAuthenticated.mockReturnValue(true)
  })

  it('redirects unauthenticated users to login', async () => {
    isAuthenticated.mockReturnValue(false)
    const { result } = renderHook(() => useBookingForm({ boat }))

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(navigateMock).toHaveBeenCalledWith('/login')
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('blocks overlapping date selections', async () => {
    const { result } = renderHook(() => useBookingForm({ boat }))

    act(() => {
      result.current.handleDateClick('2026-06-11')
      result.current.handleDateClick('2026-06-13')
    })

    await act(async () => {
      await result.current.submitBooking()
    })

    expect(result.current.error).toMatch(/unavailable days/i)
    expect(createBooking).not.toHaveBeenCalled()
  })

  it('creates a booking and resets the form on success', async () => {
    const onBookingCreated = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useBookingForm({ boat, onBookingCreated }))

    act(() => {
      result.current.handleDateClick('2026-06-14')
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
    await waitFor(() => expect(result.current.success).toMatch(/booking request sent/i))
    expect(onBookingCreated).toHaveBeenCalled()
    expect(result.current.form).toEqual({ start_date: '', end_date: '' })
  })
})

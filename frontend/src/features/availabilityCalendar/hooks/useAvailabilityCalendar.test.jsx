import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAvailabilityCalendar } from './useAvailabilityCalendar'

describe('useAvailabilityCalendar', () => {
  it('normalizes blocked ranges and marks dates as blocked', () => {
    const { result } = renderHook(() =>
      useAvailabilityCalendar({
        blockedRanges: [{ start_date: '2026-06-10', end_date: '2026-06-12', status: 'approved' }],
        selectedStartDate: '2026-06-14',
        selectedEndDate: '2026-06-16',
        monthsToShow: 2,
      })
    )

    expect(result.current.safeRanges).toHaveLength(1)
    expect(result.current.visibleMonths).toHaveLength(2)
    expect(result.current.isBlocked(new Date('2026-06-11'))).toBe(true)
    expect(result.current.getStatus(new Date('2026-06-11'))).toBe('approved')
    expect(result.current.isBlocked(new Date('2026-06-20'))).toBe(false)
  })
})

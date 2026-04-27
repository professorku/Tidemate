import { apiDelete, apiGet, apiPost, toPaginatedData } from '../client'

export const MY_BOOKING_TABS = ['all', 'upcoming', 'active', 'pending', 'completed', 'cancelled']
export const HOST_BOOKING_TABS = ['all', 'pending', 'confirmed', 'cancelled']

export function buildTimelineParams(tab, extra = {}) {
  return tab === 'all' ? extra : { ...extra, timeline: tab }
}

export function buildHostStatusParams(tab, extra = {}) {
  return tab === 'all' ? extra : { ...extra, status: tab }
}

export function createBooking(payload) {
  return apiPost('/bookings/', payload)
}

export function getBookingDetail(bookingId) {
  return apiGet(`/bookings/${bookingId}/`)
}

export function cancelBooking(bookingId, reason) {
  return apiPost(`/bookings/${bookingId}/cancel/`, { reason })
}

export function confirmBooking(bookingId) {
  return apiPost(`/bookings/${bookingId}/confirm/`)
}

export function deleteBooking(bookingId) {
  return apiDelete(`/bookings/${bookingId}/delete/`)
}

export async function getMyBookingsPage(tab, page = 1, pageSize = 8) {
  const data = await apiGet('/bookings/my/', { params: buildTimelineParams(tab, { page, page_size: pageSize }) })
  return toPaginatedData(data, { fallbackPageSize: pageSize })
}

export async function getMyBookingCounts() {
  const entries = await Promise.all(
    MY_BOOKING_TABS.map(async (tab) => {
      const data = await apiGet('/bookings/my/', { params: buildTimelineParams(tab, { page_size: 1 }) })
      const page = toPaginatedData(data, { fallbackPageSize: 1 })
      return [tab, page.count]
    })
  )

  return Object.fromEntries(entries)
}

export async function getHostBookingsPage(tab, page = 1, pageSize = 8) {
  const data = await apiGet('/bookings/host/', { params: buildHostStatusParams(tab, { page, page_size: pageSize }) })
  return toPaginatedData(data, { fallbackPageSize: pageSize })
}

export async function getHostBookingCounts() {
  const entries = await Promise.all(
    HOST_BOOKING_TABS.map(async (tab) => {
      const data = await apiGet('/bookings/host/', { params: buildHostStatusParams(tab, { page_size: 1 }) })
      const page = toPaginatedData(data, { fallbackPageSize: 1 })
      return [tab, page.count]
    })
  )

  return Object.fromEntries(entries)
}

import { apiGet, apiPost } from '../client'

export function createBookingCheckoutSession(bookingId) {
  return apiPost(`/payments/bookings/${bookingId}/checkout/`)
}

export function getBookingPaymentStatus(bookingId) {
  return apiGet(`/payments/bookings/${bookingId}/`)
}
import { apiPost } from '../../../api/client'

export function loginUser(credentials) {
  return apiPost('/users/login/', credentials)
}

export function signupUser(payload) {
  return apiPost('/users/signup/', payload)
}

export function verifyEmailToken(token) {
  return apiPost('/users/verify-email/', { token })
}

export function resendVerificationEmail(email) {
  return apiPost('/users/resend-verification/', { email })
}

export function refreshSession() {
  return apiPost('/users/refresh/', {})
}

export function logoutUser() {
  return apiPost('/users/logout/', {})
}

export function requestPasswordReset(email) {
  return apiPost('/users/forgot-password/', { email })
}

export function submitPasswordReset(payload) {
  return apiPost('/users/reset-password/', payload)
}

export function changePassword(payload) {
  return apiPost('/users/change-password/', payload)
}

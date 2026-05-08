import { apiPost } from '../../../api/client'

export function loginUser(credentials, turnstileToken) {
  return apiPost('/users/login/', {
    ...credentials,
    'cf-turnstile-response': turnstileToken,
  })
}

export function signupUser(payload, turnstileToken) {
  return apiPost('/users/signup/', {
    ...payload,
    'cf-turnstile-response': turnstileToken,
  })
}

export function loginWithGoogle(credential) {
  return apiPost('/users/google-login/', { credential })
}

export function verifyEmailToken(token) {
  return apiPost('/users/verify-email/', { token })
}

export function verifyEmailChangeToken(token) {
  return apiPost('/users/verify-email-change/', { token })
}

export function resendVerificationEmail(email, turnstileToken) {
  return apiPost('/users/resend-verification/', {
    email,
    'cf-turnstile-response': turnstileToken,
  })
}

export function refreshSession() {
  return apiPost('/users/refresh/', {})
}

export function logoutUser() {
  return apiPost('/users/logout/', {})
}

export function requestPasswordReset(email, turnstileToken) {
  return apiPost('/users/forgot-password/', {
    email,
    'cf-turnstile-response': turnstileToken,
  })
}

export function submitPasswordReset(payload) {
  return apiPost('/users/reset-password/', payload)
}

export function changePassword(payload) {
  return apiPost('/users/change-password/', payload)
}
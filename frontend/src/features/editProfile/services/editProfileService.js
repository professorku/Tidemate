import { fetchCurrentUser, patchCurrentUser } from '../../../api/domains/users'

export async function getMyProfile() {
  return fetchCurrentUser()
}

function appendIfPresent(formData, key, value) {
  if (value !== undefined && value !== null) {
    formData.append(key, value)
  }
}

export async function updateMyProfile(payload) {
  const cleanedPayload = {
    email: payload.email || '',
    location: payload.location || '',
    bio: payload.bio || '',
  }

  if (payload.current_password) {
    cleanedPayload.current_password = payload.current_password
  }

  if (payload.avatar_upload) {
    const formData = new FormData()

    appendIfPresent(formData, 'email', cleanedPayload.email)
    appendIfPresent(formData, 'location', cleanedPayload.location)
    appendIfPresent(formData, 'bio', cleanedPayload.bio)
    appendIfPresent(formData, 'current_password', cleanedPayload.current_password)
    appendIfPresent(formData, 'avatar_upload', payload.avatar_upload)

    return patchCurrentUser(formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  return patchCurrentUser(cleanedPayload)
}

export function mapProfileToForm(profile) {
  return {
    email: profile?.email || '',
    current_password: '',
    location: profile?.location || '',
    bio: profile?.bio || '',
  }
}

function flattenErrorValue(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map(flattenErrorValue).filter(Boolean)[0] || null
  }
  if (typeof value === 'object') {
    for (const nestedValue of Object.values(value)) {
      const message = flattenErrorValue(nestedValue)
      if (message) return message
    }
  }
  return null
}

export function getProfileUpdateError(err) {
  const data = err?.data || err?.response?.data

  return (
    flattenErrorValue(data?.detail) ||
    flattenErrorValue(data?.email) ||
    flattenErrorValue(data?.current_password) ||
    flattenErrorValue(data?.location) ||
    flattenErrorValue(data?.bio) ||
    flattenErrorValue(data?.avatar_upload) ||
    flattenErrorValue(data) ||
    err?.message ||
    'Failed to update profile.'
  )
}
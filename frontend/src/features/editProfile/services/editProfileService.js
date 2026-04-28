import { fetchCurrentUser, patchCurrentUser } from '../../../api/domains/users'

export async function getMyProfile() {
  return fetchCurrentUser()
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

export function getProfileUpdateError(err) {
  const data = err?.data || err?.response?.data

  return (
    data?.detail ||
    data?.email?.[0] ||
    data?.current_password?.[0] ||
    data?.location?.[0] ||
    data?.bio?.[0] ||
    'Failed to update profile'
  )
}
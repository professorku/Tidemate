import { fetchCurrentUser, patchCurrentUser } from '../../../api/domains/users'

export async function getMyProfile() {
  return fetchCurrentUser()
}

export async function updateMyProfile(payload) {
  return patchCurrentUser(payload)
}

export function mapProfileToForm(profile) {
  return {
    email: profile?.email || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
  }
}

export function getProfileUpdateError(err) {
  const data = err?.data || err?.response?.data

  return (
    data?.detail ||
    data?.email?.[0] ||
    data?.location?.[0] ||
    data?.bio?.[0] ||
    'Failed to update profile'
  )
}

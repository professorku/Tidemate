import { apiGet, apiPatch, apiPost } from '../client'
import { normalizeUser } from '../../types/domain'

export async function fetchCurrentUser() {
  const data = await apiGet('/users/me/')
  return normalizeUser(data)
}

export async function patchCurrentUser(payload, config = {}) {
  const data = await apiPatch('/users/me/', payload, config)
  return normalizeUser(data)
}

export function getPublicUserProfile(userId) {
  return apiGet(`/users/${userId}/`)
}

export function toggleCrewmate(userId) {
  return apiPost(`/users/${userId}/crew/`)
}

export function toggleBlockUser(userId) {
  return apiPost(`/users/${userId}/block/`)
}

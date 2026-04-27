import { apiDelete, apiGet, apiPost, toPaginatedData } from '../client'

export async function listConversations(params) {
  const conversations = await apiGet('/chat/conversations/', { params })
  return toPaginatedData(conversations, { fallbackPageSize: 20 })
}

export function getConversationById(conversationId) {
  return apiGet(`/chat/conversations/${conversationId}/`)
}

export async function listConversationMessages(conversationId, params) {
  const messages = await apiGet(`/chat/conversations/${conversationId}/messages/`, { params })
  return toPaginatedData(messages, { fallbackPageSize: 30 })
}

export function sendConversationMessage(conversationId, text) {
  return apiPost(`/chat/conversations/${conversationId}/messages/`, { text })
}

export function deleteConversation(conversationId) {
  return apiDelete(`/chat/conversations/${conversationId}/delete/`)
}

export function deleteMessage(messageId) {
  return apiDelete(`/chat/messages/${messageId}/delete/`)
}

export function startDirectConversation(userId) {
  return apiPost('/chat/direct/start/', {
    user_id: Number(userId),
  })
}

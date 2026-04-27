import { useCallback, useMemo } from 'react'
import { getTripState } from '../../utils/conversationFormatters'
import {
  buildConversationRoleInfo,
  getAvatarForConversationMessage,
  getQuickPromptsForConversation,
} from './roleInfo'

export function useConversationDerivedState({ conversation, me }) {
  const roleInfo = useMemo(
    () => buildConversationRoleInfo({ conversation, me }),
    [conversation, me]
  )

  const isMyMessage = useCallback(
    (message) => message.sender_username === me?.username,
    [me]
  )

  const getAvatarForMessage = useCallback(
    (message) => getAvatarForConversationMessage(conversation, message),
    [conversation]
  )

  const quickPrompts = useMemo(
    () => getQuickPromptsForConversation(conversation),
    [conversation]
  )

  const canDeleteConversation = useMemo(() => {
    if (!conversation) return false
    if (!conversation.booking_id) return true
    return conversation.booking_status === 'cancelled' || getTripState(conversation) === 'completed'
  }, [conversation])

  const tripState = useMemo(() => getTripState(conversation), [conversation])

  return {
    roleInfo,
    isMyMessage,
    getAvatarForMessage,
    quickPrompts,
    canDeleteConversation,
    tripState,
  }
}

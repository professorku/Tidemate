import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '../context/useNotifications'
import { queryKeys } from '../query/keys'

export default function useAppSync() {
  const queryClient = useQueryClient()
  const { refreshNotifications } = useNotifications()

  const syncChatState = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.chat.all })
  }, [queryClient])

  const syncNotifications = useCallback(async () => {
    await refreshNotifications()
  }, [refreshNotifications])

  const syncMessagingState = useCallback(async () => {
    await Promise.allSettled([
      syncChatState(),
      syncNotifications(),
    ])
  }, [syncChatState, syncNotifications])

  return {
    syncChatState,
    syncNotifications,
    syncMessagingState,
  }
}

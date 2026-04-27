import { useCallback } from 'react'
import { getConversationById, listConversationMessages } from '../../../../api/domains/chat'
import { createInitialMessagesPagination, normalizeMessagePage } from './pagination'

function buildMessagePagination(nextPage) {
  return {
    count: nextPage.count,
    page: nextPage.page,
    totalPages: nextPage.totalPages,
    next: nextPage.next,
    previous: nextPage.previous,
    nextCursor: nextPage.nextCursor,
    previousCursor: nextPage.previousCursor,
    hasOlder: nextPage.hasOlder,
    hasNext: nextPage.hasNext,
    hasPrevious: nextPage.hasPrevious,
    ordering: nextPage.ordering,
  }
}

export function useConversationDataFetching({
  id,
  setConversation,
  setMessages,
  setMessagesPagination,
  setLoading,
  setLoadingOlderMessages,
  setError,
}) {
  const loadConversation = useCallback(async () => {
    const found = await getConversationById(id)
    setConversation(found)
  }, [id, setConversation])

  const loadMessages = useCallback(
    async ({ cursor = null, append = false, silent = false } = {}) => {
      if (silent) {
        setLoadingOlderMessages(true)
      }

      try {
        const rawPage = await listConversationMessages(id, cursor ? { cursor } : undefined)
        const nextPage = normalizeMessagePage(rawPage)

        setMessages((prev) => {
          if (!append) {
            return nextPage.results
          }

          const existingIds = new Set(prev.map((message) => message.id))
          const olderMessages = nextPage.results.filter((message) => !existingIds.has(message.id))
          return [...olderMessages, ...prev]
        })

        setMessagesPagination(buildMessagePagination(nextPage))
        return nextPage
      } finally {
        if (silent) {
          setLoadingOlderMessages(false)
        }
      }
    },
    [id, setLoadingOlderMessages, setMessages, setMessagesPagination]
  )

  const loadPage = useCallback(async () => {
    try {
      setLoading(true)
      await Promise.all([loadConversation(), loadMessages()])
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load conversation.')
      setMessagesPagination(createInitialMessagesPagination())
    } finally {
      setLoading(false)
    }
  }, [loadConversation, loadMessages, setError, setLoading, setMessagesPagination])

  return {
    loadConversation,
    loadMessages,
    loadPage,
  }
}

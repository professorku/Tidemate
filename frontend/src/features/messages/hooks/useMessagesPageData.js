import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../context/useAuth'
import { deleteConversation, listConversations } from '../../../api/domains/chat'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'
import useAppSync from '../../../hooks/useAppSync'

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'booking', label: 'Booking' },
  { value: 'direct', label: 'Direct' },
  { value: 'unread', label: 'Unread' },
]

function canDeleteConversation(conversation) {
  if (!conversation?.booking_id) return true
  return conversation.booking_status === 'cancelled' || conversation.trip_state === 'completed'
}

function getOtherUserSearchName(conversation, currentUsername) {
  const isHost = currentUsername === conversation.host_username

  if (isHost) {
    return conversation.renter_display_name || conversation.renter_username || ''
  }

  return conversation.host_display_name || conversation.host_username || ''
}

export default function useMessagesPageData() {
  const { user: me } = useAuth()
  const queryClient = useQueryClient()
  const { syncChatState } = useAppSync()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  const conversationsQuery = useQuery({
    queryKey: queryKeys.chat.conversations(page),
    queryFn: () => listConversations({ page }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: async () => {
      await syncChatState()
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations(page),
      })
    },
  })

  const pageData = conversationsQuery.data
  const conversationsPage = useMemo(() => pageData?.results || [], [pageData])

  const counts = useMemo(
    () => ({
      all: Number(pageData?.conversationCounts?.all_count || pageData?.count || 0),
      booking: Number(pageData?.conversationCounts?.booking_count || 0),
      direct: Number(pageData?.conversationCounts?.direct_count || 0),
      unread: Number(pageData?.conversationCounts?.unread_count || 0),
    }),
    [pageData]
  )

  const sortedConversations = useMemo(() => {
    return [...conversationsPage].sort((a, b) => {
      const aDate = new Date(a.latest_message_at || a.created_at || 0).getTime()
      const bDate = new Date(b.latest_message_at || b.created_at || 0).getTime()
      return bDate - aDate
    })
  }, [conversationsPage])

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return sortedConversations.filter((conversation) => {
      const otherUserName = getOtherUserSearchName(conversation, me?.username)

      const matchesSearch = !query || [
        otherUserName,
        conversation.host_display_name,
        conversation.renter_display_name,
        conversation.host_username,
        conversation.renter_username,
        conversation.boat_title,
        conversation.last_message_text,
      ].some((value) => String(value || '').toLowerCase().includes(query))

      const matchesFilter =
        filter === 'all' ||
        (filter === 'booking' && conversation.conversation_type === 'booking') ||
        (filter === 'direct' && conversation.conversation_type === 'direct') ||
        (filter === 'unread' && conversation.unread_count > 0)

      return matchesSearch && matchesFilter
    })
  }, [filter, me?.username, search, sortedConversations])

  const pagination = {
    count: pageData?.count ?? 0,
    page: pageData?.page ?? 1,
    totalPages: pageData?.totalPages ?? 1,
    next: pageData?.next ?? null,
    previous: pageData?.previous ?? null,
  }

  return {
    conversations: filteredConversations,
    currentUsername: me?.username || '',
    counts,
    loading: conversationsQuery.isLoading,
    pageLoading: conversationsQuery.isFetching && !conversationsQuery.isLoading,
    error: conversationsQuery.error ? getErrorMessage(conversationsQuery.error, 'Could not load your conversations.') : '',
    search,
    setSearch,
    filter,
    setFilter,
    filterTabs: FILTER_TABS,
    reload: () => queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations(page) }),
    deletingConversationId: deleteMutation.isPending ? deleteMutation.variables : null,
    deleteConversation: async (conversation) => {
      if (!canDeleteConversation(conversation)) {
        throw new Error('This conversation can only be deleted when the booking is cancelled or completed.')
      }
      return deleteMutation.mutateAsync(conversation.id)
    },
    canDeleteConversation,
    pagination,
    goToPreviousPage: () => {
      if (pagination.page > 1) {
        setPage(pagination.page - 1)
      }
    },
    goToNextPage: () => {
      if (pagination.page < pagination.totalPages) {
        setPage(pagination.page + 1)
      }
    },
  }
}
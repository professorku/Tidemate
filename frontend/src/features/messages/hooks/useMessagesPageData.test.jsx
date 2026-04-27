import { renderHook, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useMessagesPageData from './useMessagesPageData'

vi.mock('../../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../../api/domains/chat', () => ({
  listConversations: vi.fn(),
  deleteConversation: vi.fn(),
}))

vi.mock('../../../hooks/useAppSync', () => ({
  default: () => ({
    syncChatState: vi.fn().mockResolvedValue(undefined),
  }),
}))

import { useAuth } from '../../../context/useAuth'
import { deleteConversation, listConversations } from '../../../api/domains/chat'

const samplePage = {
  count: 2,
  page: 1,
  totalPages: 1,
  next: null,
  previous: null,
  conversationCounts: { all_count: 2, booking_count: 1, direct_count: 1, unread_count: 1 },
  results: [
    {
      id: 1,
      host_username: 'host',
      renter_username: 'jens',
      boat_title: 'Nordlys',
      conversation_type: 'booking',
      unread_count: 1,
      booking_id: 22,
      booking_status: 'completed',
      trip_state: 'completed',
      latest_message_at: '2026-03-10T12:00:00Z',
      last_message_text: 'Ready for pickup',
    },
    {
      id: 2,
      host_username: 'anna',
      renter_username: 'jens',
      boat_title: null,
      conversation_type: 'direct',
      unread_count: 0,
      latest_message_at: '2026-03-09T12:00:00Z',
      last_message_text: 'Hello',
    },
  ],
}

describe('useMessagesPageData', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useAuth.mockReturnValue({ user: { username: 'jens' } })
    listConversations.mockResolvedValue(samplePage)
    deleteConversation.mockResolvedValue({})
  })

  it('loads, sorts, and filters conversations', async () => {
    const { result } = renderHook(() => useMessagesPageData())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.counts).toMatchObject({ all: 2, booking: 1, direct: 1, unread: 1 })
    expect(result.current.conversations.map((conversation) => conversation.id)).toEqual([1, 2])

    act(() => result.current.setFilter('unread'))
    expect(result.current.conversations.map((conversation) => conversation.id)).toEqual([1])

    act(() => result.current.setSearch('hello'))
    expect(result.current.conversations).toHaveLength(0)

    act(() => {
      result.current.setFilter('all')
      result.current.setSearch('hello')
    })
    expect(result.current.conversations.map((conversation) => conversation.id)).toEqual([2])
  })

  it('deletes eligible conversations and reloads the page', async () => {
    const { result } = renderHook(() => useMessagesPageData())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteConversation(samplePage.results[0])
    })

    expect(deleteConversation).toHaveBeenCalledWith(1)
    expect(listConversations).toHaveBeenCalledTimes(2)
  })
})

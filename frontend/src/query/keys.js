export const queryKeys = {
  listings: {
    all: ['listings'],
    page: (paramsKey) => ['listings', 'page', paramsKey],
    detail: (listingId) => ['listings', 'detail', String(listingId)],
    byHost: (hostId) => ['listings', 'host', String(hostId)],
    mine: ['listings', 'mine'],
    minePage: (page) => ['listings', 'mine', 'page', Number(page || 1)],
  },
  favorites: {
    all: ['favorites'],
    page: (page) => ['favorites', 'page', Number(page || 1)],
  },
  users: {
    current: ['users', 'current'],
    publicProfile: (userId) => ['users', 'public', String(userId)],
    reviews: (userId, page) => ['users', String(userId), 'reviews', Number(page || 1)],
  },
  chat: {
    all: ['chat'],
    conversations: (page) => ['chat', 'conversations', Number(page || 1)],
    conversation: (conversationId) => ['chat', 'conversation', String(conversationId)],
    messages: (conversationId, cursor = 'first') => ['chat', 'messages', String(conversationId), String(cursor)],
  },
  bookings: {
    all: ['bookings'],
    detail: (bookingId) => ['bookings', 'detail', String(bookingId)],
    mineCounts: ['bookings', 'mine', 'counts'],
    minePage: (tab, page) => ['bookings', 'mine', String(tab || 'all'), Number(page || 1)],
    hostCounts: ['bookings', 'host', 'counts'],
    hostPage: (tab, page) => ['bookings', 'host', String(tab || 'all'), Number(page || 1)],
  },
}

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelBooking,
  confirmBooking,
  deleteBooking,
  getHostBookingCounts,
  getHostBookingsPage,
} from '../../../api/domains/bookings'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'
import { isPastTrip } from '../utils/bookingFormatters'

const EMPTY_PAGINATION = { count: 0, page: 1, totalPages: 1 }
const EMPTY_STATS = { all: 0, pending: 0, confirmed: 0, cancelled: 0 }

export default function useHostBookingsPageData() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPageState] = useState(1)
  const [cancelReason, setCancelReason] = useState({})

  const statsQuery = useQuery({
    queryKey: queryKeys.bookings.hostCounts,
    queryFn: getHostBookingCounts,
  })

  const bookingsQuery = useQuery({
    queryKey: queryKeys.bookings.hostPage(activeTab, page),
    queryFn: () => getHostBookingsPage(activeTab, page),
  })

  useEffect(() => {
    setPageState(1)
  }, [activeTab])

  const invalidateBookings = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.hostCounts }),
      queryClient.invalidateQueries({ queryKey: ['bookings', 'host'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
    ])
  }

  const confirmMutation = useMutation({
    mutationFn: confirmBooking,
    onSuccess: invalidateBookings,
  })

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason = '' }) => cancelBooking(bookingId, reason),
    onSuccess: async () => {
      await invalidateBookings()
      setCancelReason({})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: invalidateBookings,
  })

  const pagination = bookingsQuery.data
    ? {
        count: bookingsQuery.data.count,
        page: bookingsQuery.data.page,
        totalPages: bookingsQuery.data.totalPages,
      }
    : EMPTY_PAGINATION

  const canDeleteBooking = (booking) =>
    booking?.status === 'cancelled' ||
    booking?.lifecycle_stage === 'cancelled' ||
    booking?.lifecycle_stage === 'completed' ||
    isPastTrip(booking)

  const loadBookings = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.hostPage(activeTab, page),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.hostCounts }),
    ])
  }

  return {
    activeTab,
    actionLoadingId:
      (confirmMutation.isPending && confirmMutation.variables) ||
      (cancelMutation.isPending && cancelMutation.variables?.bookingId) ||
      (deleteMutation.isPending && deleteMutation.variables) ||
      null,
    bookings: bookingsQuery.data?.results || [],
    cancelReason,
    error: bookingsQuery.error
      ? getErrorMessage(bookingsQuery.error, 'Could not load host bookings.')
      : '',
    filteredBookings: bookingsQuery.data?.results || [],
    cancelBooking: (bookingId) =>
      cancelMutation.mutateAsync({
        bookingId,
        reason: cancelReason[bookingId] || '',
      }),
    confirmBooking: (bookingId) => confirmMutation.mutateAsync(bookingId),
    deleteBooking: async (booking) => {
      const nextPage =
        (bookingsQuery.data?.results?.length ?? 0) <= 1 && page > 1
          ? page - 1
          : page

      if (nextPage !== page) {
        setPageState(nextPage)
      }

      return deleteMutation.mutateAsync(booking.id)
    },
    canDeleteBooking,
    loadBookings,
    loading: bookingsQuery.isLoading || statsQuery.isLoading,
    pageLoading: bookingsQuery.isFetching,
    pagination,
    setActiveTab,
    setCancelReason,
    setPage: (nextPage) => {
      if (nextPage < 1 || nextPage > pagination.totalPages) return
      setPageState(nextPage)
    },
    stats: statsQuery.data || EMPTY_STATS,
  }
}
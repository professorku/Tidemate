import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelBooking,
  deleteBooking,
  getMyBookingCounts,
  getMyBookingsPage,
} from '../../../api/domains/bookings'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'

const EMPTY_PAGINATION = { count: 0, page: 1, totalPages: 1 }
const EMPTY_COUNTS = { all: 0, upcoming: 0, active: 0, pending: 0, completed: 0, cancelled: 0 }

export default function useMyBookingsPageData() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPageState] = useState(1)

  const countsQuery = useQuery({
    queryKey: queryKeys.bookings.mineCounts,
    queryFn: getMyBookingCounts,
  })

  const bookingsQuery = useQuery({
    queryKey: queryKeys.bookings.minePage(activeTab, page),
    queryFn: () => getMyBookingsPage(activeTab, page),
  })

  useEffect(() => {
    setPageState(1)
  }, [activeTab])

  const invalidateBookings = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.mineCounts }),
      queryClient.invalidateQueries({ queryKey: ['bookings', 'mine'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
    ])
  }

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: invalidateBookings,
    onError: (err) => {
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not cancel booking.') })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: invalidateBookings,
    onError: (err) => {
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not delete booking.') })
    },
  })

  const pagination = bookingsQuery.data
    ? { count: bookingsQuery.data.count, page: bookingsQuery.data.page, totalPages: bookingsQuery.data.totalPages }
    : EMPTY_PAGINATION
  const filteredBookings = useMemo(() => bookingsQuery.data?.results || [], [bookingsQuery.data])

  return {
    activeTab,
    cancellingId: cancelMutation.isPending ? cancelMutation.variables : null,
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
    counts: countsQuery.data || EMPTY_COUNTS,
    error: bookingsQuery.error ? getErrorMessage(bookingsQuery.error, 'Could not load your bookings.') : '',
    filteredBookings,
    cancelBooking: (bookingId) => cancelMutation.mutateAsync(bookingId),
    deleteBooking: async (booking) => {
      const nextPage = (bookingsQuery.data?.results?.length ?? 0) <= 1 && page > 1 ? page - 1 : page
      if (nextPage !== page) {
        setPageState(nextPage)
      }
      return deleteMutation.mutateAsync(booking.id)
    },
    loadBookings: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.minePage(activeTab, page) }),
    loading: bookingsQuery.isLoading || countsQuery.isLoading,
    pagination,
    setActiveTab,
    setPage: (nextPage) => {
      if (nextPage < 1 || nextPage > pagination.totalPages) return
      setPageState(nextPage)
    },
  }
}

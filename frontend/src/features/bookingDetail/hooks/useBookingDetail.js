import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useToast } from '../../../context/useToast'
import { cancelBooking, getBookingDetail } from '../../../api/domains/bookings'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'

export function useBookingDetail() {
  const { id } = useParams()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [cancelReason, setCancelReason] = useState('')

  const bookingQuery = useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => getBookingDetail(id),
    enabled: Boolean(id),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id, cancelReason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
    },
    onError: (err) => {
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not cancel booking.') })
    },
  })

  const booking = bookingQuery.data || null

  const summaryText = useMemo(() => {
    if (!booking) return ''
    return `${booking.duration_days} day${booking.duration_days !== 1 ? 's' : ''} · ${booking.total_price} kr total`
  }, [booking])

  return {
    booking,
    loading: bookingQuery.isLoading,
    error: bookingQuery.error ? getErrorMessage(bookingQuery.error, 'Could not load booking.') : '',
    cancelReason,
    setCancelReason,
    actionLoading: cancelMutation.isPending,
    summaryText,
    handleCancel: () => cancelMutation.mutateAsync(),
    reloadBooking: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) }),
  }
}

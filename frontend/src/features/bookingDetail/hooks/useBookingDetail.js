import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { useToast } from '../../../context/useToast'
import {
  cancelBooking,
  confirmBooking,
  getBookingDetail,
} from '../../../api/domains/bookings'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'
import { formatMoney } from '../utils/bookingFormatters'
import { createBookingCheckoutSession } from '../../../api/domains/payments'

export function useBookingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [cancelReason, setCancelReason] = useState('')

  const bookingQuery = useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => getBookingDetail(id),
    enabled: Boolean(id),
  })

  const invalidateBookingData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.mineCounts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.hostCounts }),
    ])
  }

  const confirmMutation = useMutation({
    mutationFn: () => confirmBooking(id),
    onSuccess: async () => {
      await invalidateBookingData()
      showToast({ tone: 'success', message: 'Booking confirmed.' })
    },
    onError: (err) => {
      showToast({
        tone: 'error',
        message: getErrorMessage(err, 'Could not confirm booking.'),
      })
    },
  })

  const paymentMutation = useMutation({
    mutationFn: () => createBookingCheckoutSession(id),
    onSuccess: (data) => {
      const checkoutUrl = data?.checkout_url

      if (!checkoutUrl) {
        showToast({
          tone: 'error',
          message: 'Stripe Checkout did not return a checkout URL.',
        })
        return
      }

      window.location.assign(checkoutUrl)
    },
    onError: (err) => {
      showToast({
        tone: 'error',
        message: getErrorMessage(err, 'Could not start payment.'),
      })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id, cancelReason),
    onSuccess: async () => {
      setCancelReason('')
      await invalidateBookingData()
      showToast({ tone: 'success', message: 'Booking cancelled.' })
    },
    onError: (err) => {
      showToast({
        tone: 'error',
        message: getErrorMessage(err, 'Could not cancel booking.'),
      })
    },
  })

  const booking = bookingQuery.data || null

  const viewerRole = useMemo(() => {
    if (!booking || !user?.id) return 'renter'
    return Number(user.id) === Number(booking.host_id) ? 'host' : 'renter'
  }, [booking, user?.id])

  const summaryText = useMemo(() => {
    if (!booking) return ''

    const dayLabel = booking.duration_days === 1 ? 'day' : 'days'
    return `${booking.duration_days} ${dayLabel} · ${formatMoney(booking.total_price)} total`
  }, [booking])

  const reloadBooking = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) })

  return {
    booking,
    viewerRole,
    loading: bookingQuery.isLoading,
    error: bookingQuery.error
      ? getErrorMessage(bookingQuery.error, 'Could not load booking.')
      : '',
    cancelReason,
    setCancelReason,

    actionLoading:
      confirmMutation.isPending ||
      cancelMutation.isPending ||
      paymentMutation.isPending,

    confirming: confirmMutation.isPending,
    cancelling: cancelMutation.isPending,
    paying: paymentMutation.isPending,

    summaryText,
    handleConfirm: () => confirmMutation.mutateAsync(),
    handleCancel: () => cancelMutation.mutateAsync(),
    handlePay: () => paymentMutation.mutateAsync(),

    reloadBooking,
  }
}
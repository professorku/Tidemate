import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBooking } from '../../../api/domains/bookings'
import { isAuthenticated } from '../../../utils/auth'
import { getErrorMessage } from '../../../utils/errors'
import {
  parseISODate,
  daysBetween,
  rangeOverlaps,
} from '../utils/bookingDateUtils'

export function useBookingForm({ boat, onBookingCreated }) {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const blockedRanges = useMemo(() => {
    if (!Array.isArray(boat?.blocked_ranges)) return []

    return boat.blocked_ranges
      .map((range) => {
        const start = parseISODate(range.start_date)
        const end = parseISODate(range.end_date)

        if (!start || !end) return null

        return {
          start,
          end,
          start_date: range.start_date,
          end_date: range.end_date,
          status: range.status || 'pending',
        }
      })
      .filter(Boolean)
  }, [boat])

  const preview = useMemo(() => {
    if (!form.start_date || !form.end_date) return null

    const start = parseISODate(form.start_date)
    const end = parseISODate(form.end_date)

    if (!start || !end || end <= start) return null

    const days = daysBetween(start, end)
    const pricePerDay = Number(boat?.price_per_day || 0)

    return {
      days,
      pricePerDay,
      total: pricePerDay * days,
    }
  }, [form, boat])

  const selectionError = useMemo(() => {
    if (!form.start_date || !form.end_date) return ''

    const start = parseISODate(form.start_date)
    const end = parseISODate(form.end_date)

    if (!start || !end) return 'Invalid date selection.'
    if (end <= start) return 'Return date must be after the pickup date.'

    const overlapsBlocked = blockedRanges.some((range) =>
      rangeOverlaps(start, end, range.start, range.end)
    )

    if (overlapsBlocked) return 'Your selected dates include unavailable days.'

    return ''
  }, [form, blockedRanges])

  const handleDateClick = (isoDate) => {
    setError('')
    setSuccess('')

    if (!form.start_date || (form.start_date && form.end_date)) {
      setForm({
        start_date: isoDate,
        end_date: '',
      })
      return
    }

    if (isoDate < form.start_date) {
      setForm({
        start_date: isoDate,
        end_date: '',
      })
      return
    }

    if (isoDate === form.start_date) {
      setForm((prev) => ({
        ...prev,
        end_date: isoDate,
      }))

      setError('Return date must be after the pickup date.')
      return
    }

    setForm((prev) => ({
      ...prev,
      end_date: isoDate,
    }))
  }

  const clearDates = () => {
    setForm({ start_date: '', end_date: '' })
    setError('')
    setSuccess('')
  }

  const submitBooking = async () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    if (!form.start_date || !form.end_date) {
      setError('Please choose both a pickup date and a return date.')
      return
    }

    if (selectionError) {
      setError(selectionError)
      return
    }

    setLoading(true)

    try {
      await createBooking({
        boat: boat.id,
        start_date: form.start_date,
        end_date: form.end_date,
      })

      setSuccess('Booking request sent successfully.')
      setForm({ start_date: '', end_date: '' })

      if (onBookingCreated) {
        await onBookingCreated()
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create booking request.'))
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    preview,
    loading,
    error,
    success,
    selectionError,
    handleDateClick,
    clearDates,
    submitBooking,
  }
}
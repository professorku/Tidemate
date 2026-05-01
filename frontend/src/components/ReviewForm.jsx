import { useState } from 'react'
import { createReview } from '../api/domains/reviews'
import { getErrorMessage } from '../utils/errors'
import { useNotifications } from '../context/useNotifications'

const FORM_COPY = {
  boat: {
    title: 'Review this boat',
    commentLabel: 'Boat review',
    placeholder: 'How was the boat, pickup, cleanliness, and overall trip?',
    submitLabel: 'Submit boat review',
    successMessage: 'Boat review submitted.',
  },
  user: {
    title: 'Review this user',
    commentLabel: 'User review',
    placeholder: 'How was the communication and overall experience with this person?',
    submitLabel: 'Submit user review',
    successMessage: 'User review submitted.',
  },
}

const inputClassName =
  'w-full rounded-xl border border-gold/25 bg-[#071d32]/80 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25'

const labelClassName = 'mb-2 block text-sm font-medium text-white/80'

export default function ReviewForm({
  bookingId,
  reviewType = 'boat',
  onReviewCreated,
}) {
  const { refreshNotifications } = useNotifications()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const copy = FORM_COPY[reviewType] || FORM_COPY.boat
  const ratingFieldId = `${reviewType}-review-rating`
  const commentFieldId = `${reviewType}-review-comment`

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await createReview({
        booking: bookingId,
        review_type: reviewType,
        rating,
        comment,
      })

      setSuccess(copy.successMessage)
      setComment('')
      setRating(5)

      if (onReviewCreated) {
        onReviewCreated()
      }

      await refreshNotifications()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not submit review.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-5"
    >
      <h3 className="text-lg font-bold text-white">{copy.title}</h3>

      <div className="mt-4">
        <label htmlFor={ratingFieldId} className={labelClassName}>
          Rating
        </label>
        <select
          id={ratingFieldId}
          name="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className={inputClassName}
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Very good</option>
          <option value={3}>3 - Good</option>
          <option value={2}>2 - Poor</option>
          <option value={1}>1 - Very poor</option>
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor={commentFieldId} className={labelClassName}>
          {copy.commentLabel}
        </label>
        <textarea
          id={commentFieldId}
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className={inputClassName}
          placeholder={copy.placeholder}
        />
      </div>

      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-100">{success}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-full bg-gold px-5 py-2.5 font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : copy.submitLabel}
      </button>
    </form>
  )
}
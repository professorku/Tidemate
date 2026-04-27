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
    <form onSubmit={handleSubmit} className="rounded-[24px] bg-slate-50 p-5">
      <h3 className="text-lg font-bold text-slate-900">{copy.title}</h3>

      <div className="mt-4">
        <label htmlFor={ratingFieldId} className="mb-2 block text-sm font-medium text-slate-700">
          Rating
        </label>
        <select
          id={ratingFieldId}
          name="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Very good</option>
          <option value={3}>3 - Good</option>
          <option value={2}>2 - Poor</option>
          <option value={1}>1 - Very poor</option>
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor={commentFieldId} className="mb-2 block text-sm font-medium text-slate-700">
          {copy.commentLabel}
        </label>
        <textarea
          id={commentFieldId}
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
          placeholder={copy.placeholder}
        />
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-600">{success}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-full bg-navy px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : copy.submitLabel}
      </button>
    </form>
  )
}

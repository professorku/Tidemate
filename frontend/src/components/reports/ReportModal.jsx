import { useEffect, useMemo, useState } from 'react'
import {
  ExclamationTriangleIcon,
  FlagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { createReport } from '../../api/domains/reports'
import { useToast } from '../../context/useToast'
import { getErrorMessage } from '../../utils/errors'


const REPORT_REASONS = [
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'wrong_info', label: 'Wrong or misleading information' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
]

const MAX_DETAILS_LENGTH = 1000


export default function ReportModal({
  isOpen,
  targetType,
  targetId,
  targetLabel,
  onClose,
  onSuccess,
}) {
  const { showToast } = useToast()
  const [reason, setReason] = useState(REPORT_REASONS[0].value)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const targetName = targetLabel || (targetType === 'listing' ? 'this listing' : 'this user')

  const title = useMemo(() => {
    return targetType === 'listing' ? 'Report listing' : 'Report user'
  }, [targetType])

  useEffect(() => {
    if (!isOpen) return undefined

    setError('')

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) {
        onClose?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose, submitting])

  useEffect(() => {
    if (!isOpen) return

    setReason(REPORT_REASONS[0].value)
    setDetails('')
  }, [isOpen, targetType, targetId])

  if (!isOpen) return null

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!targetType || !targetId) {
      setError('Missing report target.')
      return
    }

    setSubmitting(true)

    try {
      await createReport({
        targetType,
        targetId,
        reason,
        details,
      })

      showToast({
        tone: 'success',
        title: 'Report sent',
        message: 'Thanks. A moderator can review this report.',
      })

      onSuccess?.()
      onClose?.()
    } catch (err) {
      const message = getErrorMessage(err, 'Could not submit report.')
      setError(message)
      showToast({ tone: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/60 px-4 pb-4 pt-10 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close report dialog"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!submitting) onClose?.()
        }}
      />

      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <FlagIcon className="h-6 w-6" />
              </div>

              <div>
                <h2 id="report-modal-title" className="text-xl font-extrabold tracking-tight text-slate-900">
                  {title}
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Tell us what is wrong with{' '}
                  <span className="font-semibold text-slate-800">
                    {targetName}
                  </span>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <p>{error}</p>
            </div>
          ) : null}

          <div>
            <label htmlFor="report-reason" className="text-sm font-bold text-slate-900">
              Reason
            </label>

            <select
              id="report-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={submitting}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {REPORT_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="report-details" className="text-sm font-bold text-slate-900">
                Details
              </label>

              <span className="text-xs font-medium text-slate-500">
                {details.length}/{MAX_DETAILS_LENGTH}
              </span>
            </div>

            <textarea
              id="report-details"
              value={details}
              maxLength={MAX_DETAILS_LENGTH}
              onChange={(event) => setDetails(event.target.value)}
              disabled={submitting}
              rows={5}
              placeholder="Add a short explanation. Do not include passwords, payment details, or other sensitive info."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-gold focus:ring-4 focus:ring-gold/15 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Reports are private. The reported person will not see your explanation directly.
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FlagIcon className="h-5 w-5" />
            {submitting ? 'Sending...' : 'Send report'}
          </button>
        </div>
      </form>
    </div>
  )
}
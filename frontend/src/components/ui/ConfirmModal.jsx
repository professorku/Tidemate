import { useEffect } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const TONE_STYLES = {
  danger: {
    iconWrap: 'bg-red-50 text-red-600 ring-1 ring-red-100',
    button: 'bg-red-600 text-white hover:bg-red-700',
  },
  warning: {
    iconWrap: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    button: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
  },
  neutral: {
    iconWrap: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    button: 'bg-slate-900 text-white hover:bg-slate-800',
  },
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onClose,
  onConfirm,
}) {
  const styles = TONE_STYLES[tone] || TONE_STYLES.danger

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        onClose?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/55 px-4 pb-4 pt-10 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!loading) onClose?.()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}>
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 id="confirm-modal-title" className="text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles.button}`}
          >
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

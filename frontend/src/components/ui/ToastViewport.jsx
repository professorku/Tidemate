import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

const TOAST_STYLES = {
  success: {
    icon: CheckCircleIcon,
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconClass: 'text-emerald-600',
  },
  error: {
    icon: ExclamationTriangleIcon,
    wrapper: 'border-red-200 bg-red-50 text-red-900',
    iconClass: 'text-red-600',
  },
  info: {
    icon: InformationCircleIcon,
    wrapper: 'border-slate-200 bg-white text-slate-900',
    iconClass: 'text-slate-600',
  },
}

export default function ToastViewport({ toasts = [], onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.tone] || TOAST_STYLES.info
        const Icon = style.icon

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full max-w-md rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${style.wrapper}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} />

              <div className="min-w-0 flex-1">
                {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
                <p className={`text-sm ${toast.title ? 'mt-1' : ''}`}>{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded-full p-1 text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { Link } from 'react-router-dom'

const TONE_STYLES = {
  neutral: {
    wrapper: 'border-slate-200 bg-white',
    iconWrap: 'bg-slate-100 text-slate-600',
    title: 'text-slate-900',
    text: 'text-slate-600',
    action: 'bg-slate-900 text-white hover:bg-slate-800',
  },
  subtle: {
    wrapper: 'border-slate-200 bg-slate-50',
    iconWrap: 'bg-white text-slate-600 ring-1 ring-slate-200',
    title: 'text-slate-900',
    text: 'text-slate-600',
    action: 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50',
  },
  error: {
    wrapper: 'border-red-200 bg-red-50',
    iconWrap: 'bg-white text-red-600 ring-1 ring-red-100',
    title: 'text-red-900',
    text: 'text-red-700',
    action: 'bg-red-600 text-white hover:bg-red-700',
  },
}

export default function StatePanel({
  icon,
  title,
  text,
  actionLabel,
  actionTo,
  onAction,
  tone = 'neutral',
  compact = false,
}) {
  const styles = TONE_STYLES[tone] || TONE_STYLES.neutral

  return (
    <div className={`rounded-[28px] border p-8 text-center shadow-sm ${styles.wrapper} ${compact ? 'md:p-8' : 'md:p-10'}`}>
      <div className="mx-auto max-w-lg">
        {icon ? (
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${styles.iconWrap}`}>
            {icon}
          </div>
        ) : null}

        <h2 className={`mt-4 text-2xl font-bold tracking-tight ${styles.title}`}>{title}</h2>
        <p className={`mt-2 text-sm leading-6 ${styles.text}`}>{text}</p>

        {actionLabel ? (
          <div className="mt-6">
            {actionTo ? (
              <Link
                to={actionTo}
                className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${styles.action}`}
              >
                {actionLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onAction}
                className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${styles.action}`}
              >
                {actionLabel}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

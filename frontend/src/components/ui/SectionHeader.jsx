import { Link } from 'react-router-dom'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  actionLabel,
  actionTo,
  className = '',
}) {
  const resolvedAction = action || (
    actionLabel && actionTo ? (
      <Link
        to={actionTo}
        className="text-sm font-semibold text-slate-700 underline underline-offset-4"
      >
        {actionLabel}
      </Link>
    ) : null
  )

  return (
    <div className={cn('flex flex-col gap-3 md:flex-row md:items-end md:justify-between', className)}>
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className={cn(eyebrow ? 'mt-2' : '', 'text-2xl font-bold text-slate-900')}>
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {resolvedAction}
    </div>
  )
}

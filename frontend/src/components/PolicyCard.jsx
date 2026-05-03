import {
  ClockIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const toneStyles = {
  neutral: {
    wrapper: 'border-white/15 bg-[#071d32]/80',
    iconWrap: 'border-white/15 bg-white/10 text-white',
    title: 'text-white',
    subtitle: 'text-white/65',
    bullet: 'bg-white/45',
    eyebrow: 'text-white/45',
    chip: 'border-white/10 bg-white/5 text-white/70',
  },
  info: {
    wrapper: 'border-sky-300/20 bg-[#071d32]/80',
    iconWrap: 'border-sky-300/25 bg-sky-400/10 text-sky-200',
    title: 'text-white',
    subtitle: 'text-sky-50/70',
    bullet: 'bg-sky-300',
    eyebrow: 'text-sky-200',
    chip: 'border-sky-300/15 bg-sky-400/10 text-sky-50/75',
  },
  warning: {
    wrapper: 'border-gold/25 bg-[#071d32]/80',
    iconWrap: 'border-gold/25 bg-gold/10 text-gold',
    title: 'text-white',
    subtitle: 'text-white/70',
    bullet: 'bg-gold',
    eyebrow: 'text-gold',
    chip: 'border-gold/20 bg-gold/10 text-white/75',
  },
}

function getPolicyIcon(tone) {
  if (tone === 'warning') {
    return <ReceiptPercentIcon className="h-5 w-5" />
  }

  if (tone === 'info') {
    return <ShieldCheckIcon className="h-5 w-5" />
  }

  return <SparklesIcon className="h-5 w-5" />
}

function getPolicyHighlights(policy) {
  if (!policy || typeof policy !== 'object') {
    return []
  }

  const highlights = []

  if (policy.pickup_time) {
    highlights.push({
      label: 'Pickup',
      value: policy.pickup_time,
    })
  }

  if (policy.return_time) {
    highlights.push({
      label: 'Return',
      value: policy.return_time,
    })
  }

  if (policy.max_duration_days) {
    highlights.push({
      label: 'Max',
      value: `${policy.max_duration_days} days`,
    })
  }

  if (policy.pending_booking_expiry_minutes) {
    highlights.push({
      label: 'Expires',
      value: `${policy.pending_booking_expiry_minutes} min`,
    })
  }

  if (policy.free_cancellation_window_hours) {
    highlights.push({
      label: 'Free cancel',
      value: `${policy.free_cancellation_window_hours}h`,
    })
  }

  if (policy.partial_refund_days_before) {
    highlights.push({
      label: 'Partial refund',
      value: `${policy.partial_refund_days_before}+ days`,
    })
  }

  return highlights
}

export default function PolicyCard({
  title,
  subtitle,
  items = [],
  tone = 'neutral',
  policy = null,
}) {
  const resolvedPolicy = policy && typeof policy === 'object' ? policy : null
  const resolvedTitle = title || resolvedPolicy?.title || 'Policy'
  const resolvedSubtitle =
    subtitle || resolvedPolicy?.short_text || resolvedPolicy?.display_text || ''
  const resolvedItems = items?.length ? items : resolvedPolicy?.items || []
  const highlights = getPolicyHighlights(resolvedPolicy)
  const styles = toneStyles[tone] || toneStyles.neutral

  return (
    <article
      className={`overflow-hidden rounded-[28px] border p-5 shadow-soft backdrop-blur ${styles.wrapper}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${styles.iconWrap}`}
        >
          {getPolicyIcon(tone)}
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-xs font-extrabold uppercase tracking-[0.22em] ${styles.eyebrow}`}>
            Booking policy
          </p>

          <h3 className={`mt-1 text-lg font-extrabold tracking-tight ${styles.title}`}>
            {resolvedTitle}
          </h3>

          {resolvedSubtitle ? (
            <p className={`mt-2 text-sm leading-6 ${styles.subtitle}`}>
              {resolvedSubtitle}
            </p>
          ) : null}
        </div>
      </div>

      {highlights.length ? (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {highlights.map((highlight) => (
            <div
              key={`${resolvedTitle}-${highlight.label}`}
              className={`rounded-2xl border px-3 py-2 ${styles.chip}`}
            >
              <p className={`text-[0.65rem] font-extrabold uppercase tracking-[0.16em] ${styles.eyebrow}`}>
                {highlight.label}
              </p>
              <p className="mt-1 text-sm font-extrabold text-white">
                {highlight.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {resolvedItems?.length ? (
        <ul className="mt-5 space-y-3">
          {resolvedItems.map((item, index) => (
            <li key={`${resolvedTitle}-${index}`} className="flex items-start gap-3">
              <span
                className={`mt-2.5 h-2 w-2 shrink-0 rounded-full ${styles.bullet}`}
              />
              <span className="text-sm leading-6 text-white/70">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-start gap-3 text-sm leading-6 text-white/65">
            <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            Policy details are currently unavailable.
          </div>
        </div>
      )}
    </article>
  )
}
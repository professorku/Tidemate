const toneStyles = {
  neutral: {
    wrapper: 'border-slate-200 bg-white',
    title: 'text-slate-900',
    subtitle: 'text-slate-600',
    bullet: 'bg-slate-300',
  },
  info: {
    wrapper: 'border-sky-100 bg-sky-50/70',
    title: 'text-sky-900',
    subtitle: 'text-sky-800',
    bullet: 'bg-sky-400',
  },
  warning: {
    wrapper: 'border-amber-100 bg-amber-50/80',
    title: 'text-amber-900',
    subtitle: 'text-amber-800',
    bullet: 'bg-amber-400',
  },
}

export default function PolicyCard({
  title,
  subtitle,
  items = [],
  tone = 'neutral',
}) {
  const styles = toneStyles[tone] || toneStyles.neutral

  return (
    <div className={`rounded-[22px] border p-5 shadow-soft ${styles.wrapper}`}>
      <h3 className={`text-base font-bold ${styles.title}`}>{title}</h3>

      {subtitle ? (
        <p className={`mt-2 text-sm leading-6 ${styles.subtitle}`}>{subtitle}</p>
      ) : null}

      {items?.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex items-start gap-3">
              <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${styles.bullet}`}
              />
              <span className="text-sm leading-6 text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
const SIZE_STYLES = {
  default: {
    wrapper: 'rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm',
    label: 'text-sm font-medium text-slate-500',
    value: 'mt-2 text-3xl font-extrabold text-slate-900',
    text: 'mt-1 text-sm text-slate-500',
    iconWrap: 'flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600',
    layout: 'flex items-start justify-between gap-3',
  },
  compact: {
    wrapper: 'rounded-[20px] bg-white p-4 shadow-soft',
    label: 'text-xs font-semibold uppercase tracking-wide text-slate-500',
    value: 'mt-2 text-2xl font-extrabold text-slate-900',
    text: 'mt-1.5 text-xs text-slate-500',
    iconWrap: 'flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600',
    layout: 'flex items-start justify-between gap-3',
  },
  highlight: {
    wrapper: 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft',
    label: 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500',
    value: 'mt-2 text-xl font-bold tracking-tight text-slate-900',
    text: 'mt-1 text-sm text-slate-500',
    iconWrap: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700',
    layout: 'flex items-start gap-4',
  },
  subtle: {
    wrapper: 'rounded-[24px] bg-mist p-5',
    label: 'text-sm text-slate-500',
    value: 'mt-3 text-3xl font-extrabold text-slate-900',
    text: 'mt-1 text-sm text-slate-500',
    iconWrap: 'flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600',
    layout: 'flex items-start justify-between gap-3',
  },
}

export default function StatCard({
  label,
  value,
  text,
  icon,
  size = 'default',
}) {
  const styles = SIZE_STYLES[size] || SIZE_STYLES.default

  return (
    <div className={styles.wrapper}>
      <div className={styles.layout}>
        <div className="min-w-0">
          <p className={styles.label}>{label}</p>
          <p className={styles.value}>{value}</p>
          {text ? <p className={styles.text}>{text}</p> : null}
        </div>

        {icon ? <div className={styles.iconWrap}>{icon}</div> : null}
      </div>
    </div>
  )
}

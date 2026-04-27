import { conditionMeta } from './marineConditions.utils'

export default function MarineConditionBadge({ label, compact = false }) {
  const meta = conditionMeta(label)
  const Icon = meta.Icon

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${meta.classes}`}
        title={label}
        aria-label={label}
      >
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold">{meta.label}</span>
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full px-4 py-3 ${meta.classes}`}
      title={label}
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
      <div className="text-left">
        <p className="text-sm font-bold leading-none">{meta.label}</p>
        <p className="mt-1 text-xs opacity-80">{label}</p>
      </div>
    </div>
  )
}
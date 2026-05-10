import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import {
  REASON_OPTIONS,
  STATUS_OPTIONS,
  TARGET_OPTIONS,
} from '../constants/moderationOptions'

export default function ModerationFilters({ filters, setFilters, onRefresh }) {
  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }))
  }

  const inputClass =
    'w-full rounded-2xl border border-gold/20 bg-[#071d32] px-4 py-3 text-sm font-bold text-white shadow-sm outline-none transition placeholder:text-white/35 focus:border-gold focus:ring-4 focus:ring-gold/15'

  const selectClass =
    'rounded-2xl border border-gold/20 bg-[#071d32] px-4 py-3 text-sm font-bold text-white shadow-sm outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15'

  return (
    <div className="rounded-[28px] border border-gold/20 bg-navy p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold/80" />

          <input
            value={filters.q}
            onChange={(event) => updateFilter('q', event.target.value)}
            placeholder="Search reports, users, messages..."
            className={`${inputClass} pl-11`}
          />
        </div>

        <select
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all-statuses'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.target_type}
          onChange={(event) => updateFilter('target_type', event.target.value)}
          className={selectClass}
        >
          {TARGET_OPTIONS.map((option) => (
            <option key={option.value || 'all-targets'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.reason}
          onChange={(event) => updateFilter('reason', event.target.value)}
          className={selectClass}
        >
          {REASON_OPTIONS.map((option) => (
            <option key={option.value || 'all-reasons'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Refresh
        </button>
      </div>
    </div>
  )
}
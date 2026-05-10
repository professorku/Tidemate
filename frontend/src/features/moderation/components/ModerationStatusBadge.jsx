import { STATUS_CLASSES } from '../constants/moderationOptions'

export default function ModerationStatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
        STATUS_CLASSES[status] || STATUS_CLASSES.pending
      }`}
    >
      {label || status}
    </span>
  )
}
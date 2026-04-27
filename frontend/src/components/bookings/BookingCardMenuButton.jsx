import {
  EllipsisHorizontalIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function BookingCardMenuButton({
  canDelete,
  revealed,
  isDeleting,
  deleteLabel = 'Delete',
  showLabel = 'Show actions',
  onDelete,
  onToggle,
  onHide,
}) {
  if (!canDelete) return null

  return (
    <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
      {revealed ? (
        <>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TrashIcon className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : deleteLabel}
          </button>

          <button
            type="button"
            onClick={onHide}
            className="rounded-full bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          aria-label={showLabel}
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

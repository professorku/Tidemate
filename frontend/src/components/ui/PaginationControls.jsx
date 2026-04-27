export default function PaginationControls({
  page = 1,
  totalPages = 1,
  count = 0,
  itemLabel = 'items',
  onPrevious,
  onNext,
  disabled = false,
}) {
  if (count <= 0 || totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
        {' '}· {count} {itemLabel}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={disabled || page <= 1}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={disabled || page >= totalPages}
          className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

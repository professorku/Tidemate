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
    <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-white/15 bg-[#071d32] px-4 py-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-white/65">
        Page <span className="font-semibold text-white">{page}</span> of{' '}
        <span className="font-semibold text-white">{totalPages}</span>
        {' '}· {count} {itemLabel}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={disabled || page <= 1}
          className="rounded-full border border-white/25 bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={disabled || page >= totalPages}
          className="rounded-full bg-gold px-4 py-2 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
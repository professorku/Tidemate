export default function PaginationControls({
  page = 1,
  totalPages = 1,
  count = 0,
  itemLabel = 'items',
  onPrevious,
  onNext,
  disabled = false,
  variant = 'card',
  showCount = true,
}) {
  if (count <= 0 || totalPages <= 1) {
    return null
  }

  const wrapperClass =
    variant === 'plain'
      ? 'mt-6 flex flex-col gap-3 px-1 py-2 text-white sm:flex-row sm:items-center sm:justify-between'
      : 'mt-6 flex flex-col gap-3 rounded-[24px] border border-white/15 bg-[#071d32] px-4 py-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between'

  return (
    <div className={wrapperClass}>
      <p className="text-sm text-white/65">
        Page <span className="font-semibold text-white">{page}</span> of{' '}
        <span className="font-semibold text-white">{totalPages}</span>
        {showCount ? (
          <>
            {' '}
            · {count} {itemLabel}
          </>
        ) : null}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={disabled || page <= 1}
          className="rounded-full border border-[#173047] bg-[#0b263d] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#214662] hover:bg-[#102f49] disabled:cursor-not-allowed disabled:opacity-50"
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
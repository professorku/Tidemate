import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

export default function FilterToggleButton({
  filtersOpen,
  shouldShow,
  onClick,
}) {
  return (
    <div
      className={`shrink-0 overflow-visible transition-all duration-500 ease-out ${
        shouldShow
          ? 'max-w-[8.25rem] translate-x-0 opacity-100'
          : 'pointer-events-none max-w-0 translate-x-4 opacity-0'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex h-12 min-w-0 items-center gap-1.5 rounded-full border border-transparent bg-transparent px-4 text-sm font-bold text-white shadow-none backdrop-blur transition-all duration-300 ease-out ${
          filtersOpen ? 'bg-white/10' : 'hover:bg-white/10'
        }`}
        aria-expanded={filtersOpen}
        tabIndex={shouldShow ? 0 : -1}
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4 text-white" />
        Filters
      </button>
    </div>
  )
}
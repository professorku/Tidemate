import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function SearchInput({ query, setQuery, onFocus }) {
  return (
    <label className="flex h-10 min-w-0 items-center gap-2 rounded-full px-3 transition focus-within:bg-white/10">
      <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-gold" />
      <span className="sr-only">Where are you going?</span>

      <input
        className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/65"
        placeholder="Where are you going?"
        value={query}
        onFocus={onFocus}
        onChange={(event) => setQuery(event.target.value)}
      />
    </label>
  )
}
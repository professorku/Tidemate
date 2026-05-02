export default function DesktopSearch({ query, setQuery, handleSearch }) {
  return (
    <form
      onSubmit={handleSearch}
      className="hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 backdrop-blur md:flex"
    >
      <input
        className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/70"
        placeholder="Search boats or locations..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-95"
      >
        Search
      </button>
    </form>
  )
}
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { normalizeLocationName } from '../utils/locationPickerUtils'

export default function LocationPickerSearchPanel({
  searchQuery,
  setSearchQuery,
  searching,
  searchError,
  results,
  onClearSearch,
  onSearchSelect,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-white/80">
        Search place
      </label>

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold/70" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Oslo marina, Aker Brygge, Bergen harbor..."
          className="w-full rounded-2xl border border-gold/25 bg-[#071d32]/80 py-3 pl-11 pr-11 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/45 hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {searching ? (
        <p className="mt-2 text-sm text-white/55">Searching places...</p>
      ) : null}

      {searchError ? (
        <p className="mt-2 text-sm text-red-200">{searchError}</p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-gold/20 bg-[#071d32] shadow-sm">
          {results.map((result) => (
            <button
              key={`${result.place_id}-${result.lat}-${result.lon}`}
              type="button"
              onClick={() => onSearchSelect(result)}
              className="block w-full border-b border-gold/10 px-4 py-3 text-left last:border-b-0 hover:bg-white/10"
            >
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-semibold text-white">
                    {normalizeLocationName(result) || result.display_name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-white/55">
                    {result.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
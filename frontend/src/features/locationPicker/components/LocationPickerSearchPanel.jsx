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
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Search place
      </label>

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Oslo marina, Aker Brygge, Bergen harbor..."
          className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-11 outline-none focus:border-navy"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {searching ? (
        <p className="mt-2 text-sm text-slate-500">Searching places...</p>
      ) : null}

      {searchError ? (
        <p className="mt-2 text-sm text-red-600">{searchError}</p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {results.map((result) => (
            <button
              key={`${result.place_id}-${result.lat}-${result.lon}`}
              type="button"
              onClick={() => onSearchSelect(result)}
              className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
            >
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
                <div>
                  <p className="font-semibold text-slate-900">
                    {normalizeLocationName(result) || result.display_name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
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
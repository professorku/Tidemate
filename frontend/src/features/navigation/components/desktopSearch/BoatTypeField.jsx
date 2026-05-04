import {
  ChevronDownIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline'
import { BOAT_TYPE_OPTIONS } from '../../../addBoat/constants'

export default function BoatTypeField({ value, onChange, onFocus }) {
  return (
    <div className="relative flex h-10 min-w-0 items-center gap-2 rounded-full px-3 transition hover:bg-white/10">
      <LifebuoyIcon className="h-4 w-4 shrink-0 text-gold" />

      <label htmlFor="navbar-boat-type" className="sr-only">
        Boat type
      </label>

      <select
        id="navbar-boat-type"
        value={value}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 appearance-none bg-transparent pr-6 text-sm font-bold text-white outline-none"
      >
        <option value="" className="bg-navy text-white">
          Any boat type
        </option>

        {BOAT_TYPE_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-navy text-white"
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-white/60" />
    </div>
  )
}
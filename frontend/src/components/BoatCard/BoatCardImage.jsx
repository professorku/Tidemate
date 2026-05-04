import { PhotoIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { formatBoatType, getNewLabel, formatPrice } from './formatters'
import { getBoatLocationLabel } from '../../utils/locationPrivacy'

export default function BoatCardImage({ boat, imageCount }) {
  const newLabel = getNewLabel(boat.created_at)
  const boatType = formatBoatType(boat.boat_type)
  const locationLabel = getBoatLocationLabel(boat)

  return (
    <div className="relative h-44 overflow-hidden rounded-3xl bg-[#071d32]">
      {boat.image ? (
        <img
          src={boat.thumbnail || boat.image}
          alt={boat.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
          No image
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex justify-start p-3 pr-16">
        <div className="flex items-start gap-2">
          <span className="inline-flex items-center rounded-full bg-white/40 px-3 py-1.5 text-[11px] font-bold leading-none text-navy backdrop-blur-sm">
            {boatType}
          </span>

          {newLabel && (
            <span className="inline-flex items-center rounded-full bg-amber-400/80 px-3 py-1.5 text-[11px] font-bold leading-none text-navy backdrop-blur-sm">
              {newLabel}
            </span>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 px-3 pb-3 pt-8 text-white">
        <div className="min-w-0">
          <p className="truncate font-bold">{boat.title}</p>

          <div className="flex items-center gap-1 text-xs">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{locationLabel}</span>
            <span className="mx-1">·</span>
            <span className="shrink-0">{formatPrice(boat.price_per_day)} kr</span>
          </div>
        </div>

        {imageCount > 0 && (
          <div className="ml-3 flex shrink-0 items-center gap-1 text-xs">
            <PhotoIcon className="h-3.5 w-3.5" />
            {imageCount}
          </div>
        )}
      </div>
    </div>
  )
}
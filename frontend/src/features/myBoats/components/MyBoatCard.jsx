import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  LifebuoyIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import useLongPressReveal from '../../../utils/useLongPressReveal'
import { getBoatLocationLabel } from '../../../utils/locationPrivacy'
import { formatBoatType } from '../../../utils/format/boat'
import { formatCurrency } from '../../../utils/format/number'

export default function BoatCard({ boat, onDelete, deletingId }) {
  const { revealed, toggle, hide, bind } = useLongPressReveal()
  const isDeleting = deletingId === boat.id
  const locationLabel = getBoatLocationLabel(boat, 'Location not added')
  const guestsLabel = boat.guests
    ? `${boat.guests} guest${boat.guests === 1 ? '' : 's'}`
    : 'Guests not set'

  return (
    <article
      {...bind}
      className="group relative overflow-hidden rounded-[28px] border border-transparent bg-[#071d32] text-white shadow-soft transition duration-300 hover:-translate-y-0.5"
    >
      <div className="relative h-52 overflow-hidden bg-navy">
        {boat.thumbnail || boat.image ? (
          <img
            src={boat.thumbnail || boat.image}
            alt={boat.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gold">
            <LifebuoyIcon className="h-12 w-12" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/10" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
          <div className="flex min-w-0 flex-wrap gap-2">
            <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold text-navy shadow-sm ring-1 ring-gold/40">
              {formatBoatType(boat.boat_type)}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {revealed ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete(boat.id, boat.title)
                  }}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    hide()
                  }}
                  className="rounded-full bg-gold p-2 text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
                  aria-label="Hide actions"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggle()
                }}
                className="rounded-full bg-gold p-2 text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
                aria-label="Show delete action"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
            Boat listing
          </p>

          <h2 className="mt-1 truncate text-2xl font-extrabold tracking-tight text-white">
            {boat.title}
          </h2>

          <p className="mt-2 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-white/85">
            <MapPinIcon className="h-4 w-4 shrink-0 text-gold" />
            <span className="truncate">{locationLabel}</span>
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-gold">
              Price / day
            </p>

            <p className="mt-1 truncate text-lg font-black tracking-tight text-white">
              {formatCurrency(boat.price_per_day)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-gold">
              Capacity
            </p>

            <p className="mt-1 truncate text-lg font-black tracking-tight text-white">
              {guestsLabel}
            </p>
          </div>
        </div>

        {revealed ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-50">
            Delete is visible. Use it carefully.
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
          <Link
            to={`/boats/${boat.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold px-3 py-2.5 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
          >
            <EyeIcon className="h-4 w-4" />
            View
          </Link>

          <Link
            to={`/my-boats/${boat.id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#173047] bg-[#0b263d] px-3 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#214662] hover:bg-[#102f49]"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Edit
          </Link>

          <Link
            to="/host-bookings"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#173047] bg-[#0b263d] px-3 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#214662] hover:bg-[#102f49]"
          >
            <CalendarDaysIcon className="h-4 w-4" />
            Bookings
          </Link>
        </div>
      </div>
    </article>
  )
}
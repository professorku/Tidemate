import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

export default function BoatOwnerNotice({ boat }) {
  return (
    <div className="rounded-[30px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-100 ring-1 ring-emerald-300/20">
          <ShieldCheckIcon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
            Owner view
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-white">
            This is your boat
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Booking is disabled because you are the host of this listing. Renters will
            see the booking card here.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-gold/15 bg-[#071d32]/70 p-4">
        <p className="text-sm font-bold text-white">Host tools</p>
        <p className="mt-1 text-sm leading-6 text-white/65">
          Update photos, description, location, price, or review booking requests from
          your host dashboard.
        </p>
      </div>

      <div className="mt-5 grid gap-2">
        <Link
          to={`/my-boats/${boat?.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-extrabold text-navy transition hover:bg-gold/90"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit listing
        </Link>

        <Link
          to="/host-bookings"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <CalendarDaysIcon className="h-4 w-4 text-gold" />
          Manage bookings
        </Link>
      </div>
    </div>
  )
}
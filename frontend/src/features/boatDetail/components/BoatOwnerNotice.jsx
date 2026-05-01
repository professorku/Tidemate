import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

export default function BoatOwnerNotice({ boat }) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <ShieldCheckIcon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Owner view
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-900">
            This is your boat
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Booking is disabled because you are the host of this listing. Renters will
            see the booking card here.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-900">Host tools</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Update photos, description, location, price, or review booking requests from
          your host dashboard.
        </p>
      </div>

      <div className="mt-5 grid gap-2">
        <Link
          to={`/my-boats/${boat?.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-ocean"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit listing
        </Link>

        <Link
          to="/host-bookings"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <CalendarDaysIcon className="h-4 w-4" />
          Manage bookings
        </Link>
      </div>
    </div>
  )
}
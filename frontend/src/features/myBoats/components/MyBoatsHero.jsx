import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function MyBoatsHero() {
  return (
    <section className="overflow-hidden rounded-[34px] border border-navy bg-navy px-6 py-8 text-white shadow-soft md:px-8 md:py-10">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Manage your boats
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
          Keep your listings updated, respond to incoming requests, and manage
          your hosting activity from one clean dashboard.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/add-boat"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
          >
            <PlusIcon className="h-5 w-5" />
            Add boat
          </Link>

          <Link
            to="/host-bookings"
            className="inline-flex items-center justify-center rounded-full border border-white/25 bg-navy px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean"
          >
            Manage bookings
          </Link>
        </div>
      </div>
    </section>
  )
}
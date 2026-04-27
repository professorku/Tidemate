import { Link } from 'react-router-dom'

export default function MyBoatsHero({ totalBoats }) {
  return (
    <section className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-mist px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
            Hosting
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            My boats
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Manage your listings and keep your boats ready for new bookings.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="rounded-[18px] bg-slate-50 px-4 py-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Active listings
            </span>
            <span className="mt-0.5 block text-xl font-bold text-slate-900">{totalBoats}</span>
          </div>

          <Link
            to="/add-boat"
            className="inline-flex items-center justify-center rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Add new boat
          </Link>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'

export default function HostCard({ booking }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-bold text-slate-900">Host</h2>

      <div className="mt-4">
        <p className="text-sm text-slate-500">Hosted by</p>

        <Link
          to={`/users/${booking.host_id}`}
          className="mt-1 inline-block text-base font-semibold text-navy hover:underline"
        >
          {booking.host_username}
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link
          to="/messages"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Message host
        </Link>

        <Link
          to={`/boats/${booking.boat}`}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View boat listing
        </Link>
      </div>
    </div>
  )
}
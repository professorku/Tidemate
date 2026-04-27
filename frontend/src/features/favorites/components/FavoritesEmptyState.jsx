import { Link } from 'react-router-dom'

export default function FavoritesEmptyState() {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
      <h2 className="text-2xl font-semibold text-slate-900">
        No favorites yet
      </h2>
      <p className="mt-3 text-slate-600">
        Start exploring boats and save the ones you like.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-semibold text-navy"
      >
        Browse boats
      </Link>
    </div>
  )
}
import { HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function FavoritesEmptyState() {
  return (
    <section className="rounded-[34px] border border-white/15 bg-navy p-8 text-center text-white shadow-soft md:p-12">
      <div className="mx-auto max-w-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/25">
          <HeartIcon className="h-10 w-10" />
        </div>

        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.22em] text-gold">
          Nothing saved yet
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
          No favorites yet
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/60 md:text-base">
          Start exploring boats and save the ones you like. They will appear
          here so you can easily find them again later.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            Browse boats
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            Open search
          </Link>
        </div>
      </div>
    </section>
  )
}
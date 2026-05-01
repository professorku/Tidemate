import { Link } from 'react-router-dom'
import { LifebuoyIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function EmptyBoatsState() {
  return (
    <div className="rounded-[28px] border border-dashed border-white/25 bg-white/10 p-8 text-center text-white">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
        <LifebuoyIcon className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-white">
        No boats listed yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">
        Start hosting and your listed boats will appear here. You can add a boat now
        and manage it from the host dashboard later.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          to="/add-boat"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
        >
          <PlusIcon className="h-5 w-5" />
          List your first boat
        </Link>

        <Link
          to="/my-boats"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
        >
          Host dashboard
        </Link>
      </div>
    </div>
  )
}
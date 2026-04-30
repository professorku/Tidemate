import { Link } from 'react-router-dom'
import { LifebuoyIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function EmptyBoatsState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-navy shadow-sm ring-1 ring-slate-200">
        <LifebuoyIcon className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-slate-900">
        No boats listed yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Start hosting and your listed boats will appear here. You can add a boat now
        and manage it from the host dashboard later.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          to="/add-boat"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-navy transition hover:brightness-95"
        >
          <PlusIcon className="h-5 w-5" />
          List your first boat
        </Link>

        <Link
          to="/my-boats"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Host dashboard
        </Link>
      </div>
    </div>
  )
}
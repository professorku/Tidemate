import { Link } from 'react-router-dom'
import { LifebuoyIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function EmptyBoatsState() {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
        <LifebuoyIcon className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-xl font-bold text-slate-900">No boats listed yet</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Start hosting and your listed boats will appear here.
      </p>

      <div className="mt-5">
        <Link
          to="/add-boat"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:brightness-95"
        >
          <PlusIcon className="h-5 w-5" />
          List your first boat
        </Link>
      </div>
    </div>
  )
}

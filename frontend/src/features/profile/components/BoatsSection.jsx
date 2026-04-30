import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import BoatPreviewCard from '../../../components/ui/BoatPreviewCard'
import SectionHeader from '../../../components/ui/SectionHeader'
import SectionShell from '../../../components/ui/SectionShell'
import EmptyBoatsState from './EmptyBoatsState'

export default function BoatsSection({ boats }) {
  return (
    <SectionShell as="div" className="bg-white">
      <SectionHeader
        eyebrow="Hosting"
        title="Your boats"
        description="Listings connected to your account. Renters can request these boats when they are available."
        action={(
          <div className="flex flex-wrap gap-2">
            <Link
              to="/my-boats"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage boats
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            <Link
              to="/add-boat"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-extrabold text-navy transition hover:brightness-95"
            >
              <PlusIcon className="h-4 w-4" />
              Add listing
            </Link>
          </div>
        )}
      />

      {boats.length === 0 ? (
        <div className="mt-6">
          <EmptyBoatsState />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {boats.slice(0, 4).map((boat) => (
            <BoatPreviewCard
              key={boat.id}
              boat={boat}
              badge="Listed"
              actionLabel="View listing →"
              metaAsPills
            />
          ))}
        </div>
      )}

      {boats.length > 4 ? (
        <div className="mt-5 text-center">
          <Link
            to="/my-boats"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View all {boats.length} listings
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </SectionShell>
  )
}
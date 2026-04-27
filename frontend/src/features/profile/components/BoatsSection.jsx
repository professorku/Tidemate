import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import BoatPreviewCard from '../../../components/ui/BoatPreviewCard'
import SectionHeader from '../../../components/ui/SectionHeader'
import SectionShell from '../../../components/ui/SectionShell'
import EmptyBoatsState from './EmptyBoatsState'

export default function BoatsSection({ boats }) {
  return (
    <SectionShell as="div">
      <SectionHeader
        eyebrow="Hosting"
        title="Your boats"
        action={(
          <Link
            to="/add-boat"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 underline underline-offset-4"
          >
            <PlusIcon className="h-4 w-4" />
            Add new listing
          </Link>
        )}
      />

      {boats.length === 0 ? (
        <div className="mt-6">
          <EmptyBoatsState />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {boats.map((boat) => (
            <BoatPreviewCard key={boat.id} boat={boat} badge="Listed" />
          ))}
        </div>
      )}
    </SectionShell>
  )
}

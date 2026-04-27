import { LifebuoyIcon } from '@heroicons/react/24/outline'
import EmptyState from '../../../components/ui/EmptyState'
import BoatPreviewCard from '../../../components/ui/BoatPreviewCard'

export default function PublicProfileBoats({ boats, profile }) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Boats
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Boats from {profile.username}
          </h2>
        </div>

        <p className="text-sm text-slate-500">
          {boats.length} public boat{boats.length === 1 ? '' : 's'}
        </p>
      </div>

      {boats.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<LifebuoyIcon className="h-8 w-8" />}
            title="No public boats yet"
            text={`${profile.username} has not published any boats yet. Check back later to see new listings.`}
            compact={false}
            tone="subtle"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boats.map((boat) => (
            <BoatPreviewCard
              key={boat.id}
              boat={boat}
              className="rounded-[28px] hover:-translate-y-1 hover:shadow-lg"
              imageClassName="h-48"
              actionLabel="View details →"
            />
          ))}
        </div>
      )}
    </section>
  )
}

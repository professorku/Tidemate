import { Link } from 'react-router-dom'
import {
  PencilSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function AboutSection({ profile, missingProfileItems = [] }) {
  const hasBio = Boolean(profile.bio)
  const hasMissingItems = missingProfileItems.length > 0

  return (
    <section className="rounded-[28px] border border-white/15 bg-navy p-6 text-white shadow-soft md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
            About
          </p>
        </div>

        <Link
          to="/profile/edit"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean"
        >
          <PencilSquareIcon className="h-4 w-4" />
          {hasBio ? 'Edit bio' : 'Add bio'}
        </Link>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/15 bg-white/10 p-5 md:p-6">
        <p className="whitespace-pre-wrap leading-7 text-white/80">
          {profile.bio ||
            'Tell renters and hosts a little about yourself, your boating experience, and what kind of trips you enjoy.'}
        </p>
      </div>

      {hasMissingItems ? (
        <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-gold/40 bg-gold/15 px-4 py-3 text-sm text-white">
          <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <p className="leading-6">
            Suggested next step: add {missingProfileItems.join(', ')}.
          </p>
        </div>
      ) : null}
    </section>
  )
}
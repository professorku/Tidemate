import { Link } from 'react-router-dom'
import {
  PencilSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import SectionShell from '../../../components/ui/SectionShell'
import SectionHeader from '../../../components/ui/SectionHeader'

export default function AboutSection({ profile, missingProfileItems = [] }) {
  const hasBio = Boolean(profile.bio)
  const hasMissingItems = missingProfileItems.length > 0

  return (
    <SectionShell as="div" className="bg-white">
      <SectionHeader
        eyebrow="About"
        title="Your profile story"
        description="This is the short introduction other users see when they check your profile."
        action={(
          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <PencilSquareIcon className="h-4 w-4" />
            {hasBio ? 'Edit bio' : 'Add bio'}
          </Link>
        )}
      />

      <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:p-6">
        <p className="whitespace-pre-wrap leading-7 text-slate-700">
          {profile.bio ||
            'Tell renters and hosts a little about yourself, your boating experience, and what kind of trips you enjoy.'}
        </p>
      </div>

      {hasMissingItems ? (
        <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="leading-6">
            Suggested next step: add {missingProfileItems.join(', ')}.
          </p>
        </div>
      ) : null}
    </SectionShell>
  )
}
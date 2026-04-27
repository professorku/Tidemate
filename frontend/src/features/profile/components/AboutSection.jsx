import SectionShell from '../../../components/ui/SectionShell'
import SectionHeader from '../../../components/ui/SectionHeader'

export default function AboutSection({ profile }) {
  return (
    <SectionShell as="div">
      <SectionHeader
        eyebrow="About"
        title="Your profile story"
        actionLabel={!profile.bio ? 'Add a bio' : null}
        actionTo="/profile/edit"
      />

      <div className="mt-5 rounded-[24px] bg-slate-50 p-5 md:p-6">
        <p className="whitespace-pre-wrap leading-7 text-slate-700">
          {profile.bio ||
            'Tell renters and hosts a little about yourself, your boating experience, and what kind of trips you enjoy.'}
        </p>
      </div>
    </SectionShell>
  )
}

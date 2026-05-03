import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import PolicyCard from '../../../components/PolicyCard'

const unavailableRentalPolicy = {
  title: 'Rental rules',
  short_text: 'Rental rules are loaded from the booking policy API.',
  items: [],
}

const unavailableCancellationPolicy = {
  title: 'Cancellation terms',
  short_text: 'Cancellation terms are loaded from the booking policy API.',
  items: [],
}

function resolvePolicy(policy, fallbackPolicy) {
  if (!policy || typeof policy !== 'object') {
    return fallbackPolicy
  }

  return policy
}

function StepItem({ icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20">
        {icon}
      </div>

      <div>
        <p className="text-sm font-extrabold text-white">{title}</p>
        <p className="mt-1 text-sm leading-5 text-white/60">{text}</p>
      </div>
    </div>
  )
}

export default function BookingInfoCard({ boat }) {
  const rentalPolicy = resolvePolicy(boat?.rental_policy, unavailableRentalPolicy)
  const cancellationPolicy = resolvePolicy(
    boat?.cancellation_policy,
    unavailableCancellationPolicy
  )

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[28px] border border-gold/20 bg-navy p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold">
              Request flow
            </p>
            <h3 className="mt-1 text-lg font-extrabold tracking-tight text-white">
              How booking works
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Choose dates, review the policy from the API, then send a request to the host.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <StepItem
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            title="Choose dates"
            text="Select the pickup and return dates in the calendar."
          />

          <StepItem
            icon={<CheckCircleIcon className="h-5 w-5" />}
            title="Review terms"
            text="Rental and cancellation rules come from the backend policy."
          />

          <StepItem
            icon={<PaperAirplaneIcon className="h-5 w-5" />}
            title="Send request"
            text="The host confirms or rejects the request before the trip is final."
          />
        </div>
      </section>

      <PolicyCard
        policy={rentalPolicy}
        title={rentalPolicy.title}
        subtitle={rentalPolicy.short_text}
        items={rentalPolicy.items}
        tone="info"
      />

      <PolicyCard
        policy={cancellationPolicy}
        title={cancellationPolicy.title}
        subtitle={cancellationPolicy.short_text}
        items={cancellationPolicy.items}
        tone="warning"
      />
    </div>
  )
}
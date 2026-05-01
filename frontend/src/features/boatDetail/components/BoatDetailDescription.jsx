import {
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import PolicyCard from '../../../components/PolicyCard'

export default function BoatDetailDescription({ boat }) {
  const rentalPolicy = boat?.rental_policy
  const cancellationPolicy = boat?.cancellation_policy

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy">
          <DocumentTextIcon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
            About the listing
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            About this boat
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Read the host description and rental rules before requesting a booking.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:p-6">
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 md:text-base">
          {boat.description || 'The host has not added a description yet.'}
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {rentalPolicy ? (
          <PolicyCard
            title={rentalPolicy.title}
            subtitle={rentalPolicy.short_text}
            items={rentalPolicy.items}
            tone="info"
          />
        ) : (
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
              <p className="text-sm leading-6 text-slate-600">
                Rental policy information will appear here when available.
              </p>
            </div>
          </div>
        )}

        {cancellationPolicy ? (
          <PolicyCard
            title={cancellationPolicy.title}
            subtitle={cancellationPolicy.short_text}
            items={cancellationPolicy.items}
            tone="warning"
          />
        ) : (
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
              <p className="text-sm leading-6 text-slate-600">
                Cancellation policy information will appear here when available.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 
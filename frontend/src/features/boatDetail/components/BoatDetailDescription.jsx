import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function BoatDetailDescription({ boat }) {
  return (
    <section className="rounded-[30px] border border-gold/20 bg-navy p-5 shadow-soft md:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
          <DocumentTextIcon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            About the listing
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">
            About this boat
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Read the host description before requesting a booking.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-5 md:p-6">
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-white/75 md:text-base">
          {boat.description || 'The host has not added a description yet.'}
        </p>
      </div>
    </section>
  )
}
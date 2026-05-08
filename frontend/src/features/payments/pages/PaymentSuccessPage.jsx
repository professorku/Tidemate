import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking')

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="content" className="py-10 md:py-14">
        <div className="rounded-[32px] border border-gold/20 bg-navy p-6 text-white shadow-soft md:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40">
            <CheckCircleIcon className="h-8 w-8" />
          </div>

          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
            Stripe Checkout
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Payment received
          </h1>

          <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
            Stripe sent you back to TideMate. The booking is confirmed by the backend webhook,
            so if the status has not updated yet, refresh the booking page after a few seconds.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {bookingId ? (
              <Link
                to={`/bookings/${bookingId}`}
                className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
              >
                View booking
              </Link>
            ) : null}

            <Link
              to="/my-bookings"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              My bookings
            </Link>
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
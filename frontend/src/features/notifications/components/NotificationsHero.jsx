import { BellAlertIcon } from '@heroicons/react/24/outline'

export default function NotificationsHero() {
  return (
    <section className="overflow-hidden rounded-[32px] border border-gold/20 bg-navy shadow-soft">
      <div className="relative px-6 py-8 text-white md:px-8 md:py-10">
        <div className="absolute right-8 top-8 hidden rounded-full bg-[#071d32]/80 p-5 text-gold ring-1 ring-gold/20 md:block">
          <BellAlertIcon className="h-10 w-10" />
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Notifications
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
            Booking requests, confirmations, messages, reviews, and account updates appear here.
          </p>
        </div>
      </div>
    </section>
  )
}
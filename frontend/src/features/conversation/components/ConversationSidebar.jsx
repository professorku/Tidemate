import {
  BookmarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import DetailCard from './DetailCard'
import {
  formatDate,
  formatDateTime,
  formatMoney,
  getTripStateClass,
  getTripStateLabel,
} from '../utils/conversationFormatters'

export default function ConversationSidebar({ conversation, messages, tripState }) {
  const lastMessage = messages[messages.length - 1]

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-52 overflow-hidden bg-slate-100">
          {conversation.boat_image ? (
            <img
              src={conversation.boat_image}
              alt={conversation.boat_title || 'Boat'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <BookmarkIcon className="h-10 w-10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

          <div className="absolute left-4 top-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${getTripStateClass(
                conversation
              )}`}
            >
              {getTripStateLabel(conversation)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Trip context
            </p>
            <h2 className="mt-1 truncate text-xl font-extrabold">
              {conversation.boat_title || 'Direct conversation'}
            </h2>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm leading-6 text-slate-600">
            {conversation.conversation_type === 'direct'
              ? 'This is a direct inquiry conversation.'
              : `Booking conversation linked to reservation #${conversation.booking_id ?? '—'}.`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {conversation.boat ? (
              <Link
                to={`/boats/${conversation.boat}`}
                className="rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ocean"
              >
                Open boat
              </Link>
            ) : null}

            {conversation.booking_id ? (
              <Link
                to={`/bookings/${conversation.booking_id}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Booking details
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <DetailCard
          icon={<CalendarDaysIcon className="h-5 w-5" />}
          label="Trip dates"
          value={
            conversation.start_date && conversation.end_date
              ? `${formatDate(conversation.start_date)} — ${formatDate(conversation.end_date)}`
              : 'Not tied to booking dates'
          }
        />

        <DetailCard
          icon={<CurrencyDollarIcon className="h-5 w-5" />}
          label="Total price"
          value={formatMoney(conversation.total_price)}
        />

        <DetailCard
          icon={<CreditCardIcon className="h-5 w-5" />}
          label="Booking status"
          value={
            conversation.booking_status
              ? conversation.booking_status.charAt(0).toUpperCase() +
                conversation.booking_status.slice(1)
              : 'Direct inquiry'
          }
        />

        <DetailCard
          icon={<ClockIcon className="h-5 w-5" />}
          label="Last activity"
          value={lastMessage ? formatDateTime(lastMessage.created_at) : 'No messages yet'}
        />

        <DetailCard
          icon={<UserIcon className="h-5 w-5" />}
          label="Host"
          value={conversation.host_username || '—'}
          to={conversation.host ? `/users/${conversation.host}` : undefined}
        />

        <DetailCard
          icon={<UserIcon className="h-5 w-5" />}
          label="Renter"
          value={conversation.renter_username || '—'}
          to={conversation.renter ? `/users/${conversation.renter}` : undefined}
        />

        <DetailCard
          icon={<MapPinIcon className="h-5 w-5" />}
          label="Trip state"
          value={
            tripState === 'general'
              ? 'General conversation'
              : getTripStateLabel(conversation)
          }
        />
      </div>
    </aside>
  )
}
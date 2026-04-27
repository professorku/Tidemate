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
  return (
    <aside className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-sm">
        <div className="h-48 bg-slate-200">
          {conversation.boat_image ? (
            <img
              src={conversation.boat_image}
              alt={conversation.boat_title || 'Boat'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <BookmarkIcon className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="bg-slate-100 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getTripStateClass(
                conversation
              )}`}
            >
              {getTripStateLabel(conversation)}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-bold text-slate-900">
            {conversation.boat_title || 'Boat'}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {conversation.conversation_type === 'direct'
              ? 'This is a direct inquiry conversation.'
              : `Booking conversation linked to reservation #${conversation.booking_id ?? '—'}.`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {conversation.boat ? (
              <Link
                to={`/boats/${conversation.boat}`}
                className="rounded-full bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
              >
                Open boat listing
              </Link>
            ) : null}

            {conversation.booking_id ? (
              <Link
                to={`/bookings/${conversation.booking_id}`}
                className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Booking details
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
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
          value={
            messages.length > 0
              ? formatDateTime(messages[messages.length - 1].created_at)
              : 'No messages yet'
          }
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
          value={tripState === 'general' ? 'General conversation' : getTripStateLabel(conversation)}
        />
      </div>
    </aside>
  )
}
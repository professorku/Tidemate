import {
  CalendarDaysIcon,
  CheckCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { formatDate } from '../../utils/chatFormatters'

function MetaCard({ icon, label, value, subtext }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-navy ring-1 ring-slate-200">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-bold text-slate-900">
            {value}
          </p>
          {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default function ConversationCardMetaGrid({ conversation, isHost }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <MetaCard
        icon={<CalendarDaysIcon className="h-5 w-5" />}
        label="Trip dates"
        value={
          conversation.start_date && conversation.end_date
            ? `${formatDate(conversation.start_date)} — ${formatDate(conversation.end_date)}`
            : 'No booking dates'
        }
      />

      <MetaCard
        icon={<UserCircleIcon className="h-5 w-5" />}
        label="Your role"
        value={isHost ? 'Host' : 'Renter'}
      />

      <MetaCard
        icon={<CheckCircleIcon className="h-5 w-5" />}
        label="Booking"
        value={conversation.booking_id ? `#${conversation.booking_id}` : 'Direct inquiry'}
        subtext={
          conversation.booking_status
            ? conversation.booking_status.charAt(0).toUpperCase() +
              conversation.booking_status.slice(1)
            : undefined
        }
      />
    </div>
  )
} 
import { formatDate } from '../../utils/chatFormatters'

function MetaCard({ label, value, subtext }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
      {subtext ? <p className="mt-1 text-[11px] text-slate-500">{subtext}</p> : null}
    </div>
  )
}

export default function ConversationCardMetaGrid({ conversation, isHost }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetaCard
        label="Trip dates"
        value={
          conversation.start_date && conversation.end_date
            ? `${formatDate(conversation.start_date)} — ${formatDate(conversation.end_date)}`
            : 'No booking dates'
        }
      />
      <MetaCard
        label="Booking"
        value={conversation.booking_id ? `#${conversation.booking_id}` : 'Direct inquiry'}
      />
      <MetaCard label="Role" value={isHost ? 'Host view' : 'Renter view'} />
      <MetaCard
        label="Status"
        value={
          conversation.booking_status
            ? conversation.booking_status.charAt(0).toUpperCase() +
              conversation.booking_status.slice(1)
            : 'Conversation open'
        }
      />
    </div>
  )
}

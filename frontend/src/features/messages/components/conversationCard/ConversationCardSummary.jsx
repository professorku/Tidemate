import { Link } from 'react-router-dom'
import Avatar from '../../../../components/ui/Avatar'
import {
  formatDateTime,
  formatRelative,
  getBookingStatusClass,
  getConversationTypeClass,
  getConversationTypeLabel,
  getTripStateClass,
  getTripStateLabel,
} from '../../utils/chatFormatters'

export default function ConversationCardSummary({
  conversation,
  otherUser,
  canDelete,
  lastMessage,
  unreadCount = 0,
}) {
  const lastActivity = conversation.updated_at || conversation.last_message_at

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${getConversationTypeClass(
              conversation
            )}`}
          >
            {getConversationTypeLabel(conversation)}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${getTripStateClass(
              conversation
            )}`}
          >
            {getTripStateLabel(conversation)}
          </span>

          {conversation.booking_status ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getBookingStatusClass(
                conversation.booking_status
              )}`}
            >
              {conversation.booking_status}
            </span>
          ) : null}

          {unreadCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-navy" />
              New messages
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {otherUser.id ? (
            <Link to={`/users/${otherUser.id}`} className="shrink-0">
              <Avatar avatar={otherUser.avatar} username={otherUser.username} />
            </Link>
          ) : (
            <Avatar avatar={otherUser.avatar} username={otherUser.username} />
          )}

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">
              Chatting with
            </p>

            {otherUser.id ? (
              <Link
                to={`/users/${otherUser.id}`}
                className="truncate text-base font-extrabold text-white transition hover:text-gold"
              >
                {otherUser.username || 'User'}
              </Link>
            ) : (
              <p className="truncate text-base font-extrabold text-white">
                {otherUser.username || 'User'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
          <p
            className={`line-clamp-2 text-sm leading-6 ${
              unreadCount > 0 ? 'font-semibold text-white' : 'text-white/70'
            }`}
          >
            {lastMessage}
          </p>
        </div>

        {!canDelete ? (
          <p className="mt-3 text-xs font-medium text-white/45">
            Delete becomes available when the linked booking is cancelled or completed.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/10 p-4 md:min-w-[180px]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">
          Last activity
        </p>

        <p className="mt-1 text-sm font-extrabold text-white">
          {formatRelative(lastActivity)}
        </p>

        <p className="mt-1 text-xs text-white/55">
          {formatDateTime(lastActivity)}
        </p>
      </div>
    </div>
  )
}
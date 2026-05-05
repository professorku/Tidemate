import { useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  FlagIcon,
  NoSymbolIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import ReportModal from '../../../../components/reports/ReportModal'
import { useAuth } from '../../../../context/useAuth'
import { useToast } from '../../../../context/useToast'


export default function PublicProfileActionButtons({
  profile,
  isMe,
  canMessage,
  actionLoading,
  isBlocked,
  hasBlockedYou,
  isCrewmate,
  handleStartMessage,
  handleToggleCrew,
  handleToggleBlock,
}) {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [isReportOpen, setIsReportOpen] = useState(false)

  if (isMe) {
    return null
  }

  function handleOpenReport() {
    if (!isAuthenticated) {
      showToast({
        tone: 'info',
        message: 'Log in to report a user.',
      })
      return
    }

    setIsReportOpen(true)
  }

  return (
    <>
      <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:flex-col">
        <button
          type="button"
          onClick={handleStartMessage}
          disabled={!canMessage || actionLoading !== ''}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          {actionLoading === 'message' ? 'Opening chat...' : 'Message'}
        </button>

        <button
          type="button"
          onClick={handleToggleCrew}
          disabled={isBlocked || hasBlockedYou || actionLoading !== ''}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlusIcon className="h-5 w-5 text-gold" />
          {actionLoading === 'crew' ? 'Updating...' : isCrewmate ? 'Remove crew' : 'Add to crew'}
        </button>

        <button
          type="button"
          onClick={handleToggleBlock}
          disabled={actionLoading !== ''}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
        >
          <NoSymbolIcon className="h-5 w-5 text-gold" />
          {actionLoading === 'block' ? 'Updating...' : isBlocked ? 'Unblock user' : 'Block user'}
        </button>

        <button
          type="button"
          onClick={handleOpenReport}
          disabled={actionLoading !== ''}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FlagIcon className="h-5 w-5 text-gold" />
          Report user
        </button>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        targetType="user"
        targetId={profile?.id}
        targetLabel={profile?.username}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  )
}
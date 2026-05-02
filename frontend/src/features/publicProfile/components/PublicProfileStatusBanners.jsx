export default function PublicProfileStatusBanners({
  refreshing,
  actionMessage,
  hasBlockedYou,
  isBlocked,
}) {
  return (
    <>
      {refreshing ? (
        <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/70">
          Updating profile…
        </div>
      ) : null}

      {actionMessage ? (
        <div className="mt-5 rounded-2xl border border-gold/40 bg-gold/15 px-4 py-3 text-sm font-semibold text-white">
          {actionMessage}
        </div>
      ) : null}

      {hasBlockedYou ? (
        <div className="mt-5 rounded-2xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
          You cannot message this user because they have blocked you.
        </div>
      ) : null}

      {isBlocked ? (
        <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/70">
          You have blocked this user. Messaging and crew actions are disabled.
        </div>
      ) : null}
    </>
  )
}
export default function PublicProfileStatusBanners({
  refreshing,
  actionMessage,
  hasBlockedYou,
  isBlocked,
}) {
  return (
    <>
      {refreshing ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Updating profile…
        </div>
      ) : null}

      {actionMessage ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {actionMessage}
        </div>
      ) : null}

      {hasBlockedYou ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          You cannot message this user because they have blocked you.
        </div>
      ) : null}

      {isBlocked ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
          You have blocked this user. Messaging and crew actions are disabled.
        </div>
      ) : null}
    </>
  )
}

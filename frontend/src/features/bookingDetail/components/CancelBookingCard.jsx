export default function CancelBookingCard({
  cancelReason,
  setCancelReason,
  actionLoading,
  handleCancel,
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Manage booking</h2>

      <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">
        Cancellation reason
      </label>

      <textarea
        rows="4"
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-navy"
        placeholder="Change of plans, weather, schedule conflict..."
      />

      <button
        type="button"
        onClick={handleCancel}
        disabled={actionLoading}
        className="mt-4 w-full rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {actionLoading ? 'Processing...' : 'Cancel booking'}
      </button>
    </div>
  )
}
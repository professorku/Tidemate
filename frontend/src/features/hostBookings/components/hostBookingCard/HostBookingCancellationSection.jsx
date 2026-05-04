export default function HostBookingCancellationSection({
  booking,
  canCancel,
  isCancelled,
  reasonValue,
  onReasonChange,
}) {
  return (
    <>
      {canCancel && !isCancelled ? (
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
          <label
            htmlFor={`cancel-reason-${booking.id}`}
            className="text-xs font-extrabold uppercase tracking-wide text-gold"
          >
            Optional cancellation reason
          </label>

          <textarea
            id={`cancel-reason-${booking.id}`}
            value={reasonValue}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Example: The boat is unavailable on these dates."
            className="mt-3 min-h-[86px] w-full resize-none rounded-2xl border border-white/15 bg-[#071d32] p-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </div>
      ) : null}

      {booking.cancellation_reason ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-200">
            Cancellation reason
          </p>

          <p className="mt-1 text-sm leading-6 text-red-100">
            {booking.cancellation_reason}
          </p>
        </div>
      ) : null}
    </>
  )
}
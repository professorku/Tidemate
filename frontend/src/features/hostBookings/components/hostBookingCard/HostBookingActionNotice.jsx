export default function HostBookingActionNotice({ isPending }) {
  if (!isPending) return null

  return (
    <div className="rounded-2xl border border-gold/40 bg-gold/15 px-4 py-3 text-sm text-white">
      <span className="font-semibold text-gold">Action needed:</span> Confirm the
      booking if the boat is available, or cancel the request if it cannot be
      hosted.
    </div>
  )
}
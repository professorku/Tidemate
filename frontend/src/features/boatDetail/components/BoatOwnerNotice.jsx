export default function BoatOwnerNotice() {
  return (
    <div className="rounded-[22px] bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold text-slate-900">Your boat</h2>
      <p className="mt-2 text-sm text-slate-600">
        You are the host of this listing, so booking is disabled for you.
      </p>

      <div className="mt-4 rounded-[18px] bg-mist p-4 text-sm text-slate-700">
        Guests can request dates from the booking card shown here.
      </div>
    </div>
  )
}
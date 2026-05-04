export default function NotificationsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-[28px] border border-gold/15 bg-[#071d32]/70 p-5 shadow-sm md:p-6"
        >
          <div className="flex gap-4">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/10" />

            <div className="flex-1 space-y-3">
              <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
              <div className="h-5 w-full animate-pulse rounded-full bg-white/10" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
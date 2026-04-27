export default function BaseBookingCard({ className = '', bind = {}, menu, children, footer }) {
  return (
    <article
      {...bind}
      className={`relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5 ${className}`.trim()}
    >
      {menu}

      <div className="flex flex-col gap-4">
        {children}
        {footer}
      </div>
    </article>
  )
}

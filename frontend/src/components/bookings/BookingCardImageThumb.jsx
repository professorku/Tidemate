export default function BookingCardImageThumb({
  image,
  alt,
  emptyLabel = 'No image',
  className = 'relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-200 sm:h-24 sm:w-24',
  overlay,
}) {
  return (
    <div className={className}>
      {image ? (
        <img src={image} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-slate-500">
          {emptyLabel}
        </div>
      )}

      {overlay}
    </div>
  )
}

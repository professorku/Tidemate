export default function BoatCardMedia({
  className = 'relative h-44 overflow-hidden bg-slate-200',
  image,
  title,
  imageAlt,
  emptyLabel = 'No image available',
  imageClassName = 'h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]',
  topContent,
  bottomContent,
}) {
  return (
    <div className={className}>
      {image ? (
        <img src={image} alt={imageAlt || title} className={imageClassName} />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          {emptyLabel}
        </div>
      )}

      {topContent}
      {bottomContent}
    </div>
  )
}

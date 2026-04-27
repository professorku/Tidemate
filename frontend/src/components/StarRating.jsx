export default function StarRating({
  value = 0,
  onChange = null,
  size = 'md',
  readOnly = false,
}) {
  const stars = [1, 2, 3, 4, 5]

  const sizeClass =
    size === 'lg'
      ? 'text-3xl'
      : size === 'sm'
      ? 'text-lg'
      : 'text-2xl'

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const active = star <= value

        if (readOnly) {
          return (
            <span
              key={star}
              className={`${sizeClass} ${active ? 'text-gold' : 'text-slate-300'}`}
            >
              ★
            </span>
          )
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`${sizeClass} transition ${
              active ? 'text-gold' : 'text-slate-300 hover:text-gold/70'
            }`}
            aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
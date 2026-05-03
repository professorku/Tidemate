import { XMarkIcon } from '@heroicons/react/24/outline'

const PRICE_MIN = 0
const PRICE_MAX = 100000
const PRICE_STEP = 500

const WAVE_HEIGHTS = Array.from({ length: 48 }, (_, index) => {
  const wave = Math.sin(index * 0.75)
  const secondWave = Math.sin(index * 1.35) * 0.3
  return Math.round(8 + (wave + secondWave + 1.35) * 4.5)
})

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function parseNumber(value, fallback) {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return parsed
}

function formatPrice(value) {
  return `${value.toLocaleString('nb-NO')} kr`
}

function BoatSilhouette({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M28 11V27H19L31 41V31H43L28 11Z"
        fill="currentColor"
      />
      <path
        d="M10 45H54L47 52H18C14 52 11.3 49.6 10 45Z"
        fill="currentColor"
      />
      <path
        d="M8 55C10.5 55 10.5 57 13 57C15.5 57 15.5 55 18 55C20.5 55 20.5 57 23 57C25.5 57 25.5 55 28 55C30.5 55 30.5 57 33 57C35.5 57 35.5 55 38 55C40.5 55 40.5 57 43 57C45.5 57 45.5 55 48 55C50.5 55 50.5 57 53 57C55.5 57 55.5 55 58 55"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function FiltersBar({
  filters,
  setFilters,
  onApply,
  onClear,
  onClose,
  variant = 'default',
}) {
  const inputClassName =
    'h-[42px] w-full rounded-xl border border-white/15 bg-[#071d32] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20'

  const labelClassName =
    'mb-1.5 block text-[0.68rem] font-extrabold uppercase tracking-wide text-gold'

  const isPopover = variant === 'popover'
  const minGuestsValue = filters.min_guests ?? ''

  const rawMinPrice = clamp(
    parseNumber(filters.min_price === '' ? PRICE_MIN : filters.min_price, PRICE_MIN),
    PRICE_MIN,
    PRICE_MAX
  )

  const rawMaxPrice = clamp(
    parseNumber(filters.max_price === '' ? PRICE_MAX : filters.max_price, PRICE_MAX),
    PRICE_MIN,
    PRICE_MAX
  )

  const minPrice = Math.min(rawMinPrice, rawMaxPrice)
  const maxPrice = Math.max(rawMinPrice, rawMaxPrice)

  const minPercent = ((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const maxPercent = ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const boatPercent = (minPercent + maxPercent) / 2

  const handleMinGuestsChange = (event) => {
    const nextValue = event.target.value

    if (nextValue === '') {
      setFilters({
        ...filters,
        min_guests: '',
      })
      return
    }

    setFilters({
      ...filters,
      min_guests: String(Math.max(1, Number(nextValue) || 1)),
    })
  }

  const handleMinPriceChange = (event) => {
    const nextMin = clamp(Number(event.target.value), PRICE_MIN, PRICE_MAX)
    const nextMax = Math.max(maxPrice, nextMin)

    setFilters({
      ...filters,
      min_price: String(nextMin),
      max_price: String(nextMax),
    })
  }

  const handleMaxPriceChange = (event) => {
    const nextMax = clamp(Number(event.target.value), PRICE_MIN, PRICE_MAX)
    const nextMin = Math.min(minPrice, nextMax)

    setFilters({
      ...filters,
      min_price: String(nextMin),
      max_price: String(nextMax),
    })
  }

  return (
    <div
      className={
        isPopover
          ? 'origin-top rounded-[24px] border border-gold/25 bg-navy p-4 shadow-2xl ring-1 ring-black/20'
          : 'rounded-[24px] border border-white/15 bg-navy p-3.5 shadow-soft md:p-4'
      }
    >
      {isPopover ? (
        <div className="mb-3 flex items-center justify-between gap-4 border-b border-gold/10 pb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
            Narrow down the fleet
          </h2>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-transparent p-2 text-white transition hover:border-gold/40 hover:text-gold"
              aria-label="Close filters"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[8.5rem_minmax(0,1fr)_6.5rem_6.5rem]">
        <div>
          <label className={labelClassName} htmlFor="filters-min-guests">
            Guests
          </label>

          <input
            id="filters-min-guests"
            name="min_guests"
            type="number"
            min="1"
            className={inputClassName}
            placeholder="Min guests"
            value={minGuestsValue}
            onChange={handleMinGuestsChange}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-[0.68rem] font-extrabold text-white/70">
            <span>{formatPrice(minPrice)}</span>
            <span className="text-white/35">to</span>
            <span>{formatPrice(maxPrice)}</span>
          </div>

          <div className="relative h-[42px] rounded-xl border border-white/15 bg-[#071d32] px-3">
            <div className="relative h-full min-w-0">
              <div
                className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 text-gold transition-all duration-200"
                style={{ left: `${boatPercent}%` }}
              >
                <BoatSilhouette className="h-3.5 w-3.5" />
              </div>

              <div
                className="absolute bottom-2 left-0 right-0 grid items-end gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${WAVE_HEIGHTS.length}, minmax(0, 1fr))`,
                }}
              >
                {WAVE_HEIGHTS.map((height, index) => {
                  const segmentStart = (index / WAVE_HEIGHTS.length) * 100
                  const segmentEnd = ((index + 1) / WAVE_HEIGHTS.length) * 100
                  const isActive = segmentEnd > minPercent && segmentStart < maxPercent

                  return (
                    <div
                      key={`wave-${index}`}
                      className={`rounded-full transition ${
                        isActive ? 'bg-gold' : 'bg-white/10'
                      }`}
                      style={{ height: `${height}px` }}
                    />
                  )
                })}
              </div>

              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={minPrice}
                onChange={handleMinPriceChange}
                className="pointer-events-none absolute inset-x-0 top-0 h-full w-full appearance-none bg-transparent
                  focus:outline-none
                  [&::-webkit-slider-thumb]:pointer-events-auto
                  [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:border
                  [&::-webkit-slider-thumb]:border-gold/40
                  [&::-webkit-slider-thumb]:bg-gold
                  [&::-webkit-slider-thumb]:shadow
                  [&::-moz-range-thumb]:pointer-events-auto
                  [&::-moz-range-thumb]:h-3.5
                  [&::-moz-range-thumb]:w-3.5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border
                  [&::-moz-range-thumb]:border-gold/40
                  [&::-moz-range-thumb]:bg-gold"
                aria-label="Minimum price"
              />

              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={handleMaxPriceChange}
                className="pointer-events-none absolute inset-x-0 top-0 h-full w-full appearance-none bg-transparent
                  focus:outline-none
                  [&::-webkit-slider-thumb]:pointer-events-auto
                  [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:border
                  [&::-webkit-slider-thumb]:border-gold/40
                  [&::-webkit-slider-thumb]:bg-gold
                  [&::-webkit-slider-thumb]:shadow
                  [&::-moz-range-thumb]:pointer-events-auto
                  [&::-moz-range-thumb]:h-3.5
                  [&::-moz-range-thumb]:w-3.5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border
                  [&::-moz-range-thumb]:border-gold/40
                  [&::-moz-range-thumb]:bg-gold"
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onApply}
            className="h-[42px] w-full rounded-xl bg-gold px-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
          >
            Apply
          </button>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            className="h-[42px] w-full rounded-xl border border-white/20 bg-transparent px-3 text-sm font-semibold text-white shadow-sm transition hover:border-white/40 hover:bg-white/5"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
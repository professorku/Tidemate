import MarineConditionBadge from './MarineConditionsBadge'
import { formatHour } from './marineConditions.utils'

export default function MarineForecastHourCard({ row }) {
  return (
    <div className="rounded-[20px] border border-gold/20 bg-[#071d32]/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-white">
          {formatHour(row.time)}
        </p>

        <MarineConditionBadge label={row.label} compact />
      </div>

      <div className="mt-3 space-y-1 text-sm text-white/65">
        <p>Waves: {row.wave_height_m ?? '—'} m</p>
        <p>Wind: {row.wind_speed_m_s ?? '—'} m/s</p>
        <p>Temp: {row.air_temperature_c ?? '—'}°C</p>
      </div>
    </div>
  )
}
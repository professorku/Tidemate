import MarineConditionBadge from "./MarineConditionsBadge";
import MarineMetricCard from "./MarineMetricCard";
import MarineForecastHourCard from "./MarineForecastHourCard";
import useMarineConditions from "./useMarineConditions";

export default function MarineConditionsCard({ boatId }) {
  const { data, loading, error } = useMarineConditions(boatId)

  if (loading) {
    return (
      <section className="mt-8 rounded-[28px] bg-white p-6 shadow-soft md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Water conditions</h2>
        <p className="mt-4 text-slate-600">Loading forecast...</p>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="mt-8 rounded-[28px] bg-white p-6 shadow-soft md:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Water conditions</h2>
        <p className="mt-4 text-slate-600">{error || 'No forecast available.'}</p>
      </section>
    )
  }

  const current = data.current
  return (
    <section className="mt-8 rounded-[28px] bg-white p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Water conditions</h2>
          <p className="mt-2 text-slate-600">
            Marine forecast for {data.location_name}
          </p>
        </div>

        <MarineConditionBadge label={current.label} />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-slate-900">Next 3 hours</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.next_12_hours.slice(0, 3).map((row) => (
            <MarineForecastHourCard key={row.time} row={row} />
          ))}
        </div>
      </div>
    </section>
  )
}
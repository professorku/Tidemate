export default function BoatDetailDescription({ boat }) {
  return (
    <div className="mt-5 min-w-0 space-y-5"> 
      <div className="min-w-0 rounded-[22px] bg-white p-5 shadow-soft md:p-6">
        <h2 className="text-xl font-bold text-slate-900">About this boat</h2>

        <p className="mt-3 min-w-0 whitespace-pre-wrap break-all text-sm leading-6 text-slate-700 md:text-base">
          {boat.description}
        </p>
      </div>
    </div>
  )
}

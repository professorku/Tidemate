export default function LocationPickerHelpCard() {
  return (
    <div className="rounded-[24px] border border-gold/15 bg-navy p-5 text-sm text-white/75 shadow-soft">
      <p>• Click anywhere on the map to place the boat.</p>
      <p className="mt-2">• You can also drag the marker after placing it.</p>
      <p className="mt-2">
        • Coordinates fill automatically when you choose a point.
      </p>
    </div>
  )
}
import BoatCard from './MyBoatCard'

export default function MyBoatsGrid({ boats, onDelete, deletingId }) {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {boats.map((boat) => (
        <BoatCard
          key={boat.id}
          boat={boat}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ))}
    </section>
  )
}
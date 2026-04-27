import BoatCard from '../../../components/BoatCard/BoatCard'

export default function HomeResults({ boats }) {
  return (
    <section className="w-full" aria-label="Boat listings">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {boats.map((boat) => (
          <BoatCard key={boat.id} boat={boat} />
        ))}
      </div>
    </section>
  )
}

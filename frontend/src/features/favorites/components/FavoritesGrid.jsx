import BoatCard from '../../../components/BoatCard/BoatCard'

export default function FavoritesGrid({ boats, onFavoriteChange }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {boats.map((boat) => (
        <BoatCard
          key={boat.id}
          boat={boat}
          onFavoriteChange={onFavoriteChange}
        />
      ))}
    </div>
  )
}
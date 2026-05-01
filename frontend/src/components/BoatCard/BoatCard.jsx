import { Link } from 'react-router-dom'
import BaseBoatCard from '../boats/BaseBoatCard'
import BoatCardImage from './BoatCardImage'
import FavoriteButton from './FavoriteButton'

export default function BoatCard({ boat, onFavoriteChange }) {
  const imageCount =
    Array.isArray(boat.images)
      ? boat.images.length
      : boat.image
        ? 1
        : 0

  return (
    <BaseBoatCard
      className="!border-[#071d32] !bg-transparent !shadow-none transition hover:-translate-y-1 hover:!shadow-lg"
      media={(
        <Link
          to={`/boats/${boat.id}`}
          className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#071d32]"
          aria-label={`View ${boat.title}`}
        >
          <BoatCardImage boat={boat} imageCount={imageCount} />
        </Link>
      )}
      actionSlot={(
        <FavoriteButton
          boat={boat}
          onFavoriteChange={onFavoriteChange}
          className="absolute right-3 top-3 z-10"
        />
      )}
    />
  )
}
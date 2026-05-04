import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useToast } from '../../context/useToast'
import { useAuth } from '../../context/useAuth'
import { createFavorite, deleteFavorite } from '../../api/domains/favorites'
import { getErrorMessage } from '../../utils/errors'

function getBoatFavoriteId(boat) {
  return boat?.favorite_id ?? boat?.favorite?.id ?? null
}

function getBoatFavoriteState(boat) {
  return Boolean(boat?.is_favorited || boat?.is_favorite || getBoatFavoriteId(boat))
}

export default function FavoriteButton({ boat, onFavoriteChange, className = '' }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { isAuthenticated, isAuthReady } = useAuth()

  const [favorited, setFavorited] = useState(getBoatFavoriteState(boat))
  const [favoriteId, setFavoriteId] = useState(getBoatFavoriteId(boat))
  const [submitting, setSubmitting] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setFavorited(getBoatFavoriteState(boat))
    setFavoriteId(getBoatFavoriteId(boat))
  }, [boat])

  const toggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthReady) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (submitting) return

    if (favorited && !favoriteId) {
      showToast({
        tone: 'error',
        message: 'Could not remove favorite. Please refresh and try again.',
      })
      return
    }

    setSubmitting(true)

    try {
      if (favorited) {
        const removedFavoriteId = favoriteId

        await deleteFavorite(removedFavoriteId)

        setFavorited(false)
        setFavoriteId(null)

        // Callback format:
        // onFavoriteChange(boatId, isFavorite, favoriteId, favorite)
        onFavoriteChange?.(boat.id, false, null, { id: removedFavoriteId })
      } else {
        const favorite = await createFavorite(boat.id)
        const nextFavoriteId = favorite?.id ?? favorite?.favorite_id ?? null

        setFavorited(true)
        setFavoriteId(nextFavoriteId)

        // Callback format:
        // onFavoriteChange(boatId, isFavorite, favoriteId, favorite)
        onFavoriteChange?.(boat.id, true, nextFavoriteId, favorite)
      }

      setAnimate(true)
      setTimeout(() => setAnimate(false), 180)
    } catch (err) {
      showToast({
        tone: 'error',
        message: getErrorMessage(err, 'Could not update favorites.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={submitting || !isAuthReady}
      aria-pressed={favorited}
      aria-label={favorited ? `Remove ${boat.title} from favorites` : `Add ${boat.title} to favorites`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`${className} flex h-9 w-9 items-center justify-center rounded-full bg-white/60 shadow-md backdrop-blur-sm transition ${animate ? 'scale-125' : 'hover:scale-110'} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {favorited ? (
        <HeartSolid className="h-5 w-5 text-red-500" />
      ) : (
        <HeartOutline className="h-5 w-5 text-slate-700" />
      )}
    </button>
  )
}
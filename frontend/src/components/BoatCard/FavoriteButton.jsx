import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useToast } from '../../context/useToast'
import { createFavorite, deleteFavorite } from '../../api/domains/favorites'
import { isAuthenticated } from '../../utils/auth'
import { getErrorMessage } from '../../utils/errors'

export default function FavoriteButton({ boat, onFavoriteChange, className = '' }) {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [favorited, setFavorited] = useState(Boolean(boat.is_favorited))
  const [favoriteId, setFavoriteId] = useState(boat.favorite_id ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setFavorited(Boolean(boat.is_favorited))
    setFavoriteId(boat.favorite_id ?? null)
  }, [boat])

  const toggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    if (submitting) return

    setSubmitting(true)

    try {
      if (favorited) {
        await deleteFavorite(favoriteId)
        setFavorited(false)
        setFavoriteId(null)
        onFavoriteChange?.(false, boat)
      } else {
        const favorite = await createFavorite(boat.id)
        setFavorited(true)
        setFavoriteId(favorite.id)
        onFavoriteChange?.(true, boat)
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
      disabled={submitting}
      aria-pressed={favorited}
      aria-label={favorited ? `Remove ${boat.title} from favorites` : `Add ${boat.title} to favorites`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`${className} flex h-9 w-9 items-center justify-center rounded-full bg-white/60 shadow-md backdrop-blur-sm transition ${animate ? 'scale-125' : 'hover:scale-110'}`}
    >
      {favorited ? <HeartSolid className="h-5 w-5 text-red-500" /> : <HeartOutline className="h-5 w-5 text-slate-700" />}
    </button>
  )
}

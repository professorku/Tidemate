import { useEffect, useMemo, useState } from 'react'
import { PhotoIcon } from '@heroicons/react/24/outline'
import FavoriteButton from './BoatCard/FavoriteButton'

export default function BoatImageGallery({
  boat,
  isOwner = false,
  onFavoriteChange,
}) {
  const images = useMemo(() => {
    if (Array.isArray(boat?.images) && boat.images.length > 0) {
      return boat.images
    }

    if (boat?.image) {
      return [
        {
          id: 'fallback-cover',
          image: boat.image,
          is_cover: true,
        },
      ]
    }

    return []
  }, [boat])

  const initialMain = useMemo(() => {
    return images.find((img) => img.is_cover) || images[0] || null
  }, [images])

  const [selectedImage, setSelectedImage] = useState(initialMain)

  useEffect(() => {
    setSelectedImage(initialMain)
  }, [initialMain])

  if (images.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[32px] bg-slate-200">
        {!isOwner ? (
          <FavoriteButton
            boat={boat}
            onFavoriteChange={onFavoriteChange}
            className="absolute right-4 top-4 z-10 !h-12 !w-12 border border-white/70 !bg-white/85 text-navy shadow-lg backdrop-blur-md hover:!bg-white"
          />
        ) : null}

        <div className="flex h-[260px] items-center justify-center md:h-[420px]">
          <div className="flex flex-col items-center text-slate-500">
            <PhotoIcon className="h-12 w-12" />
            <p className="mt-3">No photos yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-[32px] bg-slate-200">
        {!isOwner ? (
          <FavoriteButton
            boat={boat}
            onFavoriteChange={onFavoriteChange}
            className="absolute right-4 top-4 z-10 !h-12 !w-12 border border-white/70 !bg-white/85 text-navy shadow-lg backdrop-blur-md hover:!bg-white"
          />
        ) : null}

        <img
          src={selectedImage?.image}
          alt={boat?.title}
          decoding="async"
          fetchPriority="high"
          className="h-[260px] w-full object-cover md:h-[420px]"
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-5">
          {images.map((img) => {
            const active = selectedImage?.id === img.id

            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`relative overflow-hidden rounded-[20px] border-2 transition ${
                  active ? 'border-gold' : 'border-transparent'
                }`}
              >
                <img
                  src={img.thumbnail || img.image}
                  alt={boat?.title}
                  loading="lazy"
                  decoding="async"
                  className="h-20 w-full object-cover md:h-24"
                />
                {img.is_cover ? (
                  <span className="absolute left-2 top-2 rounded-full bg-navy/90 px-2 py-1 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
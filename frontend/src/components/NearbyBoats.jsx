import { useEffect, useState } from 'react'
import BoatCard from '../components/BoatCard/BoatCard'
import { getNearbyListings } from '../api/domains/listings'

export default function NearbyBoats({ boat }) {
  const [nearbyBoats, setNearbyBoats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNearbyBoats = async () => {
      if (!boat?.latitude || !boat?.longitude) {
        setNearbyBoats([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const listings = await getNearbyListings({
          latitude: boat.latitude,
          longitude: boat.longitude,
          excludeId: boat.id,
          radiusKm: 25,
          pageSize: 6,
        })

        setNearbyBoats(listings)
      } catch (error) {
        console.error('Failed to load nearby boats:', error)
        setNearbyBoats([])
      } finally {
        setLoading(false)
      }
    }

    loadNearbyBoats()
  }, [boat])

  return (
    <section className="mt-8 rounded-[28px] border border-gold/20 bg-navy p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Nearby boats
          </h2>

          <p className="text-white/65">
            Explore other boats in the same area.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-white/65">
          Loading nearby boats...
        </p>
      ) : nearbyBoats.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-6 text-white/65">
          No nearby boats found for this area yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {nearbyBoats.map((nearbyBoat) => (
            <BoatCard
              key={nearbyBoat.id}
              boat={nearbyBoat}
              showFavorite={false}
            />
          ))}
        </div>
      )}
    </section>
  )
}
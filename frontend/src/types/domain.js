/**
 * Shared domain typedefs and light-weight normalizers for the TideMate frontend.
 * These keep API mapping logic in one place even while the app is still JavaScript-first.
 */

/**
 * @typedef {Object} ListingImage
 * @property {number|string|null} id
 * @property {string|null} image
 * @property {boolean} is_cover
 */

/**
 * @typedef {Object} Listing
 * @property {number|string|null} id
 * @property {string} title
 * @property {string} description
 * @property {string} boat_type
 * @property {string} location_name
 * @property {string|null} pickup_address
 * @property {string|null} pickup_instructions
 * @property {number|null} latitude
 * @property {number|null} longitude
 * @property {number|null} approximate_latitude
 * @property {number|null} approximate_longitude
 * @property {boolean} exact_location_available
 * @property {string} location_precision
 * @property {number|null} location_radius_km
 * @property {string} location_disclosure_message
 * @property {number|null} guests
 * @property {number|null} price_per_day
 * @property {ListingImage[]} images
 * @property {number|string|null} host_id
 * @property {boolean} is_favorite
 */

/**
 * @typedef {Object} Review
 * @property {number|string|null} id
 * @property {number|string|null} rating
 * @property {string} comment
 * @property {string|null} created_at
 * @property {number|string|null} booking_id
 * @property {number|string|null} reviewer_id
 * @property {number|string|null} reviewee_id
 */

/**
 * @typedef {Object} User
 * @property {number|string|null} id
 * @property {string} username
 * @property {string} email
 * @property {string} location
 * @property {string} bio
 * @property {string|null} avatar
 */

/**
 * @typedef {Object} Booking
 * @property {number|string|null} id
 * @property {string|null} public_id
 * @property {string|null} start_date
 * @property {string|null} end_date
 * @property {string} status
 * @property {number|string|null} total_price
 * @property {number|string|null} guests
 * @property {number|null} latitude
 * @property {number|null} longitude
 * @property {number|null} approximate_latitude
 * @property {number|null} approximate_longitude
 * @property {boolean} exact_location_available
 * @property {string} location_precision
 * @property {number|null} location_radius_km
 * @property {string} location_disclosure_message
 * @property {string|null} pickup_address
 * @property {string|null} pickup_instructions
 * @property {Listing|null} boat
 */

function toNumberOrNull(value) {
  if (value === '' || value == null) return null

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function normalizeImage(image) {
  if (!image || typeof image !== 'object') {
    return { id: null, image: null, is_cover: false }
  }

  return {
    id: image.id ?? null,
    image: image.image ?? image.url ?? null,
    is_cover: Boolean(image.is_cover),
  }
}

function normalizeLocationPrecision(value) {
  if (value === 'exact' || value === 'approximate' || value === 'unavailable') {
    return value
  }

  return 'unavailable'
}

/** @returns {Listing} */
export function normalizeListing(listing) {
  if (!listing || typeof listing !== 'object') {
    return {
      id: null,
      title: '',
      description: '',
      boat_type: 'other',
      location_name: '',
      pickup_address: null,
      pickup_instructions: null,
      latitude: null,
      longitude: null,
      approximate_latitude: null,
      approximate_longitude: null,
      exact_location_available: false,
      location_precision: 'unavailable',
      location_radius_km: null,
      location_disclosure_message: '',
      guests: null,
      price_per_day: null,
      images: [],
      host_id: null,
      is_favorite: false,
    }
  }

  return {
    ...listing,
    id: listing.id ?? null,
    title: listing.title ?? '',
    description: listing.description ?? '',
    boat_type: listing.boat_type ?? 'other',
    location_name: listing.location_name ?? '',
    pickup_address: listing.pickup_address ?? null,
    pickup_instructions: listing.pickup_instructions ?? null,
    latitude: toNumberOrNull(listing.latitude),
    longitude: toNumberOrNull(listing.longitude),
    approximate_latitude: toNumberOrNull(listing.approximate_latitude),
    approximate_longitude: toNumberOrNull(listing.approximate_longitude),
    exact_location_available: Boolean(listing.exact_location_available),
    location_precision: normalizeLocationPrecision(listing.location_precision),
    location_radius_km: toNumberOrNull(listing.location_radius_km),
    location_disclosure_message: listing.location_disclosure_message ?? '',
    guests: toNumberOrNull(listing.guests),
    price_per_day: toNumberOrNull(listing.price_per_day),
    images: Array.isArray(listing.images) ? listing.images.map(normalizeImage) : [],
    host_id: listing.host_id ?? listing.host?.id ?? null,
    is_favorite: Boolean(listing.is_favorite),
  }
}

/** @returns {Review} */
export function normalizeReview(review) {
  if (!review || typeof review !== 'object') {
    return {
      id: null,
      rating: null,
      comment: '',
      created_at: null,
      booking_id: null,
      reviewer_id: null,
      reviewee_id: null,
    }
  }

  return {
    ...review,
    id: review.id ?? null,
    rating: review.rating ?? null,
    comment: review.comment ?? '',
    created_at: review.created_at ?? null,
    booking_id: review.booking_id ?? review.booking?.id ?? null,
    reviewer_id: review.reviewer_id ?? review.reviewer?.id ?? null,
    reviewee_id: review.reviewee_id ?? review.reviewee?.id ?? null,
  }
}

/** @returns {User} */
export function normalizeUser(user) {
  if (!user || typeof user !== 'object') {
    return {
      id: null,
      username: '',
      email: '',
      location: '',
      bio: '',
      avatar: null,
    }
  }

  return {
    ...user,
    id: user.id ?? null,
    username: user.username ?? '',
    email: user.email ?? '',
    location: user.location ?? '',
    bio: user.bio ?? '',
    avatar: user.avatar ?? null,
  }
}

/** @returns {Booking} */
export function normalizeBooking(booking) {
  if (!booking || typeof booking !== 'object') {
    return {
      id: null,
      public_id: null,
      start_date: null,
      end_date: null,
      status: '',
      total_price: null,
      guests: null,
      latitude: null,
      longitude: null,
      approximate_latitude: null,
      approximate_longitude: null,
      exact_location_available: false,
      location_precision: 'unavailable',
      location_radius_km: null,
      location_disclosure_message: '',
      pickup_address: null,
      pickup_instructions: null,
      boat: null,
    }
  }

  return {
    ...booking,
    id: booking.id ?? null,
    public_id: booking.public_id ?? null,
    start_date: booking.start_date ?? null,
    end_date: booking.end_date ?? null,
    status: booking.status ?? '',
    total_price: booking.total_price ?? null,
    guests: booking.guests ?? null,
    latitude: toNumberOrNull(booking.latitude),
    longitude: toNumberOrNull(booking.longitude),
    approximate_latitude: toNumberOrNull(booking.approximate_latitude),
    approximate_longitude: toNumberOrNull(booking.approximate_longitude),
    exact_location_available: Boolean(booking.exact_location_available),
    location_precision: normalizeLocationPrecision(booking.location_precision),
    location_radius_km: toNumberOrNull(booking.location_radius_km),
    location_disclosure_message: booking.location_disclosure_message ?? '',
    pickup_address: booking.pickup_address ?? null,
    pickup_instructions: booking.pickup_instructions ?? null,
    boat: booking.boat ? normalizeListing(booking.boat) : null,
  }
}

export function normalizeCollection(items, normalizer) {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizer(item))
}
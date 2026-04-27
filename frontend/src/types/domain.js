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
 * @property {number|null} latitude
 * @property {number|null} longitude
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
 * @property {string|null} start_date
 * @property {string|null} end_date
 * @property {string} status
 * @property {number|string|null} total_price
 * @property {number|string|null} guests
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

/** @returns {Listing} */
export function normalizeListing(listing) {
  if (!listing || typeof listing !== 'object') {
    return {
      id: null,
      title: '',
      description: '',
      boat_type: 'other',
      location_name: '',
      latitude: null,
      longitude: null,
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
    latitude: toNumberOrNull(listing.latitude),
    longitude: toNumberOrNull(listing.longitude),
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
      start_date: null,
      end_date: null,
      status: '',
      total_price: null,
      guests: null,
      boat: null,
    }
  }

  return {
    ...booking,
    id: booking.id ?? null,
    start_date: booking.start_date ?? null,
    end_date: booking.end_date ?? null,
    status: booking.status ?? '',
    total_price: booking.total_price ?? null,
    guests: booking.guests ?? null,
    boat: booking.boat ? normalizeListing(booking.boat) : null,
  }
}

export function normalizeCollection(items, normalizer) {
  if (!Array.isArray(items)) return []
  return items.map((item) => normalizer(item))
}

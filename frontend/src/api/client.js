import axios from 'axios'
import { clearSessionHint, markSessionHintActive } from '../utils/auth'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
const DEFAULT_API_TIMEOUT_MS = 15000

function parseApiTimeoutMs(value) {
  const timeout = Number(value)

  if (Number.isFinite(timeout) && timeout > 0) {
    return timeout
  }

  return DEFAULT_API_TIMEOUT_MS
}

const apiTimeout = parseApiTimeoutMs(import.meta.env.VITE_API_TIMEOUT_MS)

export class ApiError extends Error {
  constructor(message, { status = null, data = null, originalError = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.originalError = originalError
  }
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: apiTimeout,
})

let refreshPromise = null
let csrfPromise = null

function getCsrfTokenFromCookie() {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function ensureCsrfCookie() {
  const existingToken = getCsrfTokenFromCookie()

  if (existingToken) {
    return existingToken
  }

  if (!csrfPromise) {
    csrfPromise = axios
      .get(`${baseURL}/users/csrf/`, {
        withCredentials: true,
        timeout: apiTimeout,
      })
      .then(() => getCsrfTokenFromCookie())
      .finally(() => {
        csrfPromise = null
      })
  }

  return csrfPromise
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = ensureCsrfCookie()
      .then((csrfToken) =>
        axios.post(
          `${baseURL}/users/refresh/`,
          {},
          {
            withCredentials: true,
            timeout: apiTimeout,
            headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
          }
        )
      )
      .then((response) => {
        markSessionHintActive()
        return response.data
      })
      .catch((error) => {
        clearSessionHint()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toLowerCase()

    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = await ensureCsrfCookie()

      if (csrfToken) {
        config.headers = config.headers || {}
        config.headers['X-CSRFToken'] = csrfToken
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

function getRequestUrl(config) {
  return String(config?.url || '')
}

function shouldSkipRefresh(config) {
  const url = getRequestUrl(config)

  return (
    config?._retry ||
    url.includes('/users/login/') ||
    url.includes('/users/logout/') ||
    url.includes('/users/refresh/') ||
    url.includes('/users/signup/') ||
    url.includes('/users/forgot-password/') ||
    url.includes('/users/reset-password/')
  )
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !shouldSkipRefresh(originalRequest)) {
      originalRequest._retry = true

      try {
        await refreshAccessToken()
        return api(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export function normalizeApiError(error, fallbackMessage = 'Something went wrong.') {
  if (error instanceof ApiError) {
    return error
  }

  const responseData = error?.response?.data
  const isTimeout = error?.code === 'ECONNABORTED' || error?.message?.toLowerCase().includes('timeout')
  const message = isTimeout
    ? 'The request timed out. Please try again.'
    : responseData?.detail ||
      responseData?.message ||
      error?.message ||
      fallbackMessage

  return new ApiError(message, {
    status: error?.response?.status ?? null,
    data: responseData ?? null,
    originalError: error,
  })
}

export function isPaginatedResponse(data) {
  return Boolean(data) && typeof data === 'object' && Array.isArray(data.results)
}

function getNormalizedPagination(data, fallbackPageSize) {
  const pagination = data?.pagination || null

  if (pagination) {
    return {
      type: pagination.type || 'page_number',
      count: Number(pagination.count ?? data.count ?? 0),
      next: pagination.next || data.next || null,
      previous: pagination.previous || data.previous || null,
      page:
        pagination.page == null
          ? 1
          : Number(pagination.page || data.current_page || data.page || 1),
      pageSize: Number(pagination.page_size || data.page_size || data.results?.length || fallbackPageSize || 0),
      totalPages:
        pagination.total_pages == null
          ? 1
          : Number(pagination.total_pages || data.total_pages || 1),
      hasNext: Boolean(pagination.has_next ?? pagination.next ?? data.next),
      hasPrevious: Boolean(pagination.has_previous ?? pagination.previous ?? data.previous),
      nextCursor: pagination.next_cursor || null,
      previousCursor: pagination.previous_cursor || null,
      ordering: Array.isArray(pagination.ordering) ? pagination.ordering : [],
    }
  }

  const pageSize = Number(data?.page_size || data?.results?.length || fallbackPageSize || 0)
  const count = Number(data?.count || 0)
  const hasExplicitPageNumbers =
    data?.current_page !== undefined ||
    data?.page !== undefined ||
    data?.total_pages !== undefined ||
    data?.count !== undefined

  return {
    type: hasExplicitPageNumbers ? 'page_number' : 'single',
    count,
    next: data?.next || null,
    previous: data?.previous || null,
    page: hasExplicitPageNumbers ? Number(data?.current_page || data?.page || 1) : 1,
    pageSize,
    totalPages: hasExplicitPageNumbers
      ? Number(data?.total_pages) || (pageSize > 0 ? Math.ceil(count / pageSize) : 1)
      : 1,
    hasNext: Boolean(data?.next),
    hasPrevious: Boolean(data?.previous),
    nextCursor: null,
    previousCursor: null,
    ordering: [],
  }
}

export function toPaginatedData(data, { fallbackPageSize = 0 } = {}) {
  if (isPaginatedResponse(data)) {
    const pagination = getNormalizedPagination(data, fallbackPageSize)
    const count = pagination.type === 'cursor' ? data.results.length : pagination.count

    return {
      paginationType: pagination.type,
      count,
      next: pagination.next,
      previous: pagination.previous,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrevious: pagination.hasPrevious,
      nextCursor: pagination.nextCursor,
      previousCursor: pagination.previousCursor,
      ordering: pagination.ordering,
      results: data.results,
      average_rating: data.average_rating ?? null,
      review_count: data.review_count ?? count,
      conversationCounts: data.conversation_counts ?? null,
    }
  }

  const results = Array.isArray(data) ? data : []
  const count = results.length

  return {
    paginationType: 'single',
    count,
    next: null,
    previous: null,
    page: 1,
    pageSize: count,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    nextCursor: null,
    previousCursor: null,
    ordering: [],
    results,
    average_rating: data?.average_rating ?? null,
    review_count: data?.review_count ?? count,
    conversationCounts: data?.conversation_counts ?? null,
  }
}

export function toResultsArray(data) {
  return toPaginatedData(data).results
}

async function request(method, url, config = {}) {
  try {
    const response = await api.request({
      method,
      url,
      ...config,
    })

    return response.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export function apiGet(url, config) {
  return request('get', url, config)
}

export function apiPost(url, data, config) {
  return request('post', url, { ...config, data })
}

export function apiPut(url, data, config) {
  return request('put', url, { ...config, data })
}

export function apiPatch(url, data, config) {
  return request('patch', url, { ...config, data })
}

export function apiDelete(url, config) {
  return request('delete', url, config)
}

export default api
import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMocks = vi.hoisted(() => {
  const dispatchMock = vi.fn()
  const getMock = vi.fn()
  const postMock = vi.fn()

  let requestFulfilled = null
  let responseRejected = null

  const apiInstance = vi.fn((config) => apiInstance.request(config))

  apiInstance.interceptors = {
    request: {
      use: vi.fn((fulfilled) => {
        requestFulfilled = fulfilled
        return 1
      }),
    },
    response: {
      use: vi.fn((_fulfilled, rejected) => {
        responseRejected = rejected
        return 1
      }),
    },
  }

  apiInstance.request = vi.fn(async (config) => {
    const preparedConfig = requestFulfilled
      ? await requestFulfilled({
          ...config,
          headers: {
            ...(config.headers || {}),
          },
        })
      : config

    try {
      return await dispatchMock(preparedConfig)
    } catch (error) {
      if (!error.config) {
        error.config = preparedConfig
      }

      if (responseRejected) {
        return responseRejected(error)
      }

      throw error
    }
  })

  function reset() {
    requestFulfilled = null
    responseRejected = null

    dispatchMock.mockReset()
    getMock.mockReset()
    postMock.mockReset()

    apiInstance.mockClear()
    apiInstance.request.mockClear()
    apiInstance.interceptors.request.use.mockClear()
    apiInstance.interceptors.response.use.mockClear()
  }

  return {
    apiInstance,
    dispatchMock,
    getMock,
    postMock,
    reset,
  }
})

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => axiosMocks.apiInstance),
    get: axiosMocks.getMock,
    post: axiosMocks.postMock,
  },
}))

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()

    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
}

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`
}

function setSessionHint() {
  window.localStorage.setItem('tidemate:session-hint', '1')
}

describe('api client auth and error handling', () => {
  beforeEach(() => {
    vi.resetModules()
    axiosMocks.reset()
    window.localStorage.clear()
    clearCookies()
  })

  it('adds a CSRF token to unsafe requests', async () => {
    axiosMocks.getMock.mockImplementation(async () => {
      setCookie('csrftoken', 'csrf-from-cookie')
      return { data: {} }
    })

    axiosMocks.dispatchMock.mockResolvedValue({
      data: {
        ok: true,
      },
    })

    const { apiPost } = await import('./client')

    const response = await apiPost('/boats/', {
      title: 'Secure boat',
    })

    expect(response).toEqual({
      ok: true,
    })

    expect(axiosMocks.getMock).toHaveBeenCalledWith(
      '/api/users/csrf/',
      expect.objectContaining({
        withCredentials: true,
        timeout: 15000,
      })
    )

    expect(axiosMocks.dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        url: '/boats/',
        data: {
          title: 'Secure boat',
        },
        headers: expect.objectContaining({
          'X-CSRFToken': 'csrf-from-cookie',
        }),
      })
    )
  })

  it('refreshes once and retries the original request after a 401 when a session hint exists', async () => {
    setSessionHint()

    axiosMocks.getMock.mockImplementation(async () => {
      setCookie('csrftoken', 'refresh-csrf')
      return { data: {} }
    })

    axiosMocks.postMock.mockResolvedValue({
      data: {
        detail: 'refreshed',
      },
    })

    let requestCount = 0

    axiosMocks.dispatchMock.mockImplementation(async (config) => {
      requestCount += 1

      if (requestCount === 1) {
        throw {
          response: {
            status: 401,
            data: {
              detail: 'Access token expired.',
            },
          },
          config,
        }
      }

      return {
        data: {
          id: 1,
          username: 'jens',
        },
      }
    })

    const { apiGet } = await import('./client')

    const response = await apiGet('/users/me/')

    expect(response).toEqual({
      id: 1,
      username: 'jens',
    })

    expect(axiosMocks.postMock).toHaveBeenCalledWith(
      '/api/users/refresh/',
      {},
      expect.objectContaining({
        withCredentials: true,
        timeout: 15000,
        headers: {
          'X-CSRFToken': 'refresh-csrf',
        },
      })
    )

    expect(axiosMocks.dispatchMock).toHaveBeenCalledTimes(2)
    expect(axiosMocks.dispatchMock.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        method: 'get',
        url: '/users/me/',
        _retry: true,
      })
    )
  })

  it('clears the session hint when refresh fails', async () => {
    setSessionHint()

    axiosMocks.getMock.mockImplementation(async () => {
      setCookie('csrftoken', 'refresh-csrf')
      return { data: {} }
    })

    axiosMocks.postMock.mockRejectedValue({
      response: {
        status: 401,
        data: {
          detail: 'Refresh token expired.',
        },
      },
    })

    axiosMocks.dispatchMock.mockImplementation(async (config) => {
      throw {
        response: {
          status: 401,
          data: {
            detail: 'Access token expired.',
          },
        },
        config,
      }
    })

    const { apiGet } = await import('./client')

    await expect(apiGet('/users/me/')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Refresh token expired.',
    })

    expect(window.localStorage.getItem('tidemate:session-hint')).toBeNull()
  })

  it('does not try to refresh after a failed login request', async () => {
    setSessionHint()
    setCookie('csrftoken', 'login-csrf')

    axiosMocks.dispatchMock.mockImplementation(async (config) => {
      throw {
        response: {
          status: 401,
          data: {
            detail: 'Invalid username or password.',
          },
        },
        config,
      }
    })

    const { apiPost } = await import('./client')

    await expect(
      apiPost('/users/login/', {
        username: 'jens',
        password: 'wrong-password',
      })
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Invalid username or password.',
    })

    expect(axiosMocks.postMock).not.toHaveBeenCalled()
  })

  it('normalizes API errors with response details', async () => {
    const { normalizeApiError } = await import('./client')

    const normalized = normalizeApiError(
      {
        response: {
          status: 403,
          data: {
            detail: 'You do not have permission to perform this action.',
          },
        },
      },
      'Fallback message.'
    )

    expect(normalized).toMatchObject({
      name: 'ApiError',
      status: 403,
      message: 'You do not have permission to perform this action.',
      data: {
        detail: 'You do not have permission to perform this action.',
      },
    })
  })
})
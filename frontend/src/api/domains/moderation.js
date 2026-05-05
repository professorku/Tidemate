import { apiGet, apiPatch } from '../client'


function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}


export function getModerationReportStats() {
  return apiGet('/moderation/reports/stats/')
}


export function getModerationReports(params = {}) {
  return apiGet(`/moderation/reports/${buildQuery(params)}`)
}


export function updateModerationReport(reportId, payload) {
  return apiPatch(`/moderation/reports/${reportId}/`, payload)
}
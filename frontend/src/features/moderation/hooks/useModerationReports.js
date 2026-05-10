import { useCallback, useEffect, useMemo, useState } from 'react'
import { toPaginatedData } from '../../../api/client'
import {
  getModerationReports,
  getModerationReportStats,
  updateModerationReport,
} from '../../../api/domains/moderation'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'

const DEFAULT_FILTERS = {
  q: '',
  status: 'pending',
  target_type: '',
  reason: '',
  page: 1,
}

export default function useModerationReports() {
  const { showToast } = useToast()

  const [stats, setStats] = useState(null)
  const [reportsData, setReportsData] = useState(() => toPaginatedData([]))
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [notesById, setNotesById] = useState({})
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const queryParams = useMemo(() => ({
    q: filters.q,
    status: filters.status,
    target_type: filters.target_type,
    reason: filters.reason,
    page: filters.page,
  }), [filters])

  const loadData = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const [statsResponse, reportsResponse] = await Promise.all([
        getModerationReportStats(),
        getModerationReports(queryParams),
      ])

      const normalizedReports = toPaginatedData(reportsResponse, {
        fallbackPageSize: 12,
      })

      setStats(statsResponse)
      setReportsData(normalizedReports)

      setNotesById((current) => {
        const next = { ...current }

        normalizedReports.results.forEach((report) => {
          if (next[report.id] === undefined) {
            next[report.id] = report.admin_notes || ''
          }
        })

        return next
      })
    } catch (err) {
      const message = getErrorMessage(err, 'Could not load moderation reports.')
      setError(message)
      showToast({ tone: 'error', message })
    } finally {
      setLoading(false)
    }
  }, [queryParams, showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function handleNoteChange(reportId, value) {
    setNotesById((current) => ({
      ...current,
      [reportId]: value,
    }))
  }

  async function handleUpdateStatus(report, status) {
    setUpdatingId(report.id)

    try {
      const updatedReport = await updateModerationReport(report.id, {
        status,
        admin_notes: notesById[report.id] || '',
      })

      setReportsData((current) => ({
        ...current,
        results: current.results.map((item) => (
          item.id === report.id ? updatedReport : item
        )),
      }))

      setNotesById((current) => ({
        ...current,
        [updatedReport.id]: updatedReport.admin_notes || '',
      }))

      showToast({
        tone: 'success',
        title: 'Report updated',
        message: `Report marked as ${updatedReport.status_display || updatedReport.status}.`,
      })

      const latestStats = await getModerationReportStats()
      setStats(latestStats)
    } catch (err) {
      const message = getErrorMessage(err, 'Could not update report.')
      showToast({ tone: 'error', message })
    } finally {
      setUpdatingId(null)
    }
  }

  return {
    stats,
    reportsData,
    filters,
    setFilters,
    notesById,
    loading,
    updatingId,
    error,
    loadData,
    handleNoteChange,
    handleUpdateStatus,
  }
}
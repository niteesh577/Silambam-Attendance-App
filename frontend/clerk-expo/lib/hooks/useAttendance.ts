import { useApiClient } from '../ApiContext'
import { useFetch } from './useFetch'

export function useAttendance() {
  const api = useApiClient()

  const { data: records, loading: loadingRecords, error: errorRecords, execute: fetchRecords } = useFetch(api.getAttendance)
  const { data: report,  loading: loadingReport,  error: errorReport,  execute: fetchReport }  = useFetch(api.getAttendanceReport)
  const { execute: bulkMark, loading: submitting } = useFetch(api.bulkMarkAttendance)

  return {
    records, loadingRecords, errorRecords, fetchRecords,
    report,  loadingReport,  errorReport,  fetchReport,
    bulkMark, submitting,
  }
}

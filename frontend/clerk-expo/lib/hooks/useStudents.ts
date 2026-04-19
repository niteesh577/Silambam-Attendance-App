import { useApiClient } from '../ApiContext'
import { useFetch } from './useFetch'
import type { StudentCreate, StudentUpdate, FeeStatus } from '../types'

export function useStudents() {
  const api = useApiClient()

  const { data: students, loading: loadingStudents, error: errorStudents, execute: fetchStudents } = useFetch(api.getStudents)
  const { data: student,  loading: loadingStudent,  error: errorStudent,  execute: fetchStudent }  = useFetch(api.getStudent)
  const { data: summary,  loading: loadingSummary,  error: errorSummary,  execute: fetchSummary }  = useFetch(api.getStudentAttendanceSummary)

  const { execute: createStudent, loading: creating } = useFetch(api.createStudent)
  const { execute: updateStudent, loading: updating } = useFetch(api.updateStudent)
  const { execute: deleteStudent, loading: deleting } = useFetch(api.softDeleteStudent)
  
  const { execute: promoteStudent,  loading: promoting } = useFetch(api.promoteStudent)
  const { execute: updateFeeStatus, loading: updatingFee } = useFetch(api.updateFeeStatus)
  const { execute: updateNotes,     loading: updatingNotes } = useFetch(api.updateNotes)

  return {
    // Queries
    students, loadingStudents, errorStudents, fetchStudents,
    student,  loadingStudent,  errorStudent,  fetchStudent,
    summary,  loadingSummary,  errorSummary,  fetchSummary,
    // Mutations
    createStudent, creating,
    updateStudent, updating,
    deleteStudent, deleting,
    promoteStudent, promoting,
    updateFeeStatus, updatingFee,
    updateNotes, updatingNotes,
  }
}

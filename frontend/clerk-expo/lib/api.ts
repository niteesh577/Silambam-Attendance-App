import type {
  Attendance,
  AttendanceBulkCreate,
  AttendanceFilters,
  AttendanceSummary,
  Branch,
  BranchCreate,
  BranchSummary,
  BranchUpdate,
  Student,
  StudentCreate,
  StudentFilters,
  StudentUpdate,
  User,
} from '@/lib/types'

const BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8002').replace(/\/$/, '')

// ─── Helper: build query string ────────────────────────────────────────────────
function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  if (!entries.length) return ''
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  getToken: () => Promise<string | null>,
  init: RequestInit = {},
): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as object | undefined),
    },
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail ? (typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)) : detail
    } catch { }
    throw new Error(detail)
  }

  const json = await res.json()
  // Unwrap the { data, message } envelope from the backend
  return (json.data ?? json) as T
}

// ─── API Client factory ─────────────────────────────────────────────────────────
export function createApiClient(getToken: () => Promise<string | null>) {
  const r = <T>(endpoint: string, init?: RequestInit) =>
    request<T>(endpoint, getToken, init)

  return {
    // ── Auth ──────────────────────────────────────────────────────────────────
    getMe: () =>
      r<User>('/api/auth/me'),

    // ── Branches ──────────────────────────────────────────────────────────────
    getBranches: () =>
      r<Branch[]>('/api/branches'),

    getBranch: (id: string) =>
      r<Branch>(`/api/branches/${id}`),

    createBranch: (data: BranchCreate) =>
      r<Branch>('/api/branches', { method: 'POST', body: JSON.stringify(data) }),

    updateBranch: (id: string, data: BranchUpdate) =>
      r<Branch>(`/api/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    deleteBranch: (id: string) =>
      r<void>(`/api/branches/${id}`, { method: 'DELETE' }),

    getBranchSummary: (id: string) =>
      r<BranchSummary>(`/api/branches/${id}/summary`),

    // ── Students ──────────────────────────────────────────────────────────────
    getStudents: (filters?: StudentFilters) =>
      r<Student[]>('/api/students' + buildQuery(filters as Record<string, unknown>)),

    getStudent: (id: string) =>
      r<Student>(`/api/students/${id}`),

    createStudent: (data: StudentCreate) =>
      r<Student>('/api/students', { method: 'POST', body: JSON.stringify(data) }),

    updateStudent: (id: string, data: StudentUpdate) =>
      r<Student>(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    softDeleteStudent: (id: string) =>
      r<Student>(`/api/students/${id}`, { method: 'DELETE' }),

    promoteStudent: (id: string) =>
      r<Student>(`/api/students/${id}/promote`, { method: 'PATCH' }),

    updateFeeStatus: (id: string, fee_status: 'paid' | 'unpaid') =>
      r<Student>(`/api/students/${id}/fee`, {
        method: 'PATCH',
        body: JSON.stringify({ fee_status }),
      }),

    updateNotes: (id: string, notes: string) =>
      r<Student>(`/api/students/${id}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      }),

    getStudentAttendanceSummary: (id: string) =>
      r<AttendanceSummary>(`/api/students/${id}/summary`),

    // ── Attendance ────────────────────────────────────────────────────────────
    bulkMarkAttendance: (data: AttendanceBulkCreate) =>
      r<Attendance[]>('/api/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getAttendance: (filters?: AttendanceFilters) =>
      r<Attendance[]>('/api/attendance' + buildQuery(filters as Record<string, unknown>)),

    getAttendanceReport: (branch_id: string, from_date: string, to_date: string) =>
      r<Attendance[]>(
        `/api/attendance/report?branch_id=${branch_id}&from_date=${from_date}&to_date=${to_date}`,
      ),

    getStudentAttendanceSummaryFromAttendance: (student_id: string) =>
      r<AttendanceSummary>(`/api/attendance/${student_id}/summary`),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

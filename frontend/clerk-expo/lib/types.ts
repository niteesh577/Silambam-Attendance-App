// All TypeScript types mirroring the FastAPI backend schemas

export type UserRole = 'coach' | 'admin'

export interface User {
  id: string
  clerk_user_id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

// ─── Branch ──────────────────────────────────────────────────────────────────
export interface Branch {
  id: string
  coach_id: string
  name: string
  location: string
  city: string
  created_at: string
}

export interface BranchCreate {
  name: string
  location: string
  city: string
}

export interface BranchUpdate {
  name?: string
  location?: string
  city?: string
}

export interface BranchSummary {
  total_students: number
  active_students: number
  belt_distribution: Record<string, number>
  attendance_today: number
}

// ─── Student ─────────────────────────────────────────────────────────────────
export type BeltColor =
  | 'white' | 'yellow' | 'orange' | 'green'
  | 'blue'  | 'red'    | 'brown'

export type FeeStatus = 'paid' | 'unpaid'

export interface Student {
  id: string
  coach_id: string
  branch_id: string
  name: string
  age: number
  parent_name: string
  phone: string
  belt: BeltColor
  blood_group: string | null
  address: string | null
  dob: string | null
  emis_no: string | null
  aadhaar_no: string | null
  ident_mark_1: string | null
  ident_mark_2: string | null
  joined_date: string        // ISO date string "YYYY-MM-DD"
  notes: string
  fee_status: FeeStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudentCreate {
  branch_id: string
  name: string
  age: number
  parent_name: string
  phone: string
  belt: BeltColor
  blood_group?: string
  address?: string
  dob?: string
  emis_no?: string
  aadhaar_no?: string
  ident_mark_1?: string
  ident_mark_2?: string
  joined_date: string
  fee_status?: FeeStatus
}

export interface StudentUpdate {
  branch_id?: string
  name?: string
  age?: number
  parent_name?: string
  phone?: string
  belt?: BeltColor
  blood_group?: string
  address?: string
  dob?: string
  emis_no?: string
  aadhaar_no?: string
  ident_mark_1?: string
  ident_mark_2?: string
  joined_date?: string
  notes?: string
  fee_status?: FeeStatus
  is_active?: boolean
}

export interface StudentFilters {
  branch_id?: string
  belt?: BeltColor
  fee_status?: FeeStatus
  search?: string
  page?: number
  limit?: number
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export type AttendanceStatus = 'present' | 'absent'

export interface Attendance {
  id: string
  student_id: string
  coach_id: string
  session_date: string     // ISO date "YYYY-MM-DD"
  status: AttendanceStatus
  marked_by: string | null
  created_at: string
}

export interface AttendanceRecord {
  student_id: string
  status: AttendanceStatus
}

export interface AttendanceBulkCreate {
  branch_id: string
  session_date: string
  records: AttendanceRecord[]
}

export interface AttendanceFilters {
  branch_id?: string
  date?: string
}

export interface AttendanceSummary {
  total_sessions: number
  present_count: number
  absent_count: number
  percentage: number
}

// ─── API envelope ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message: string
  page?: number
  limit?: number
}

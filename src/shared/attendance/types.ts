export interface AttendancePolicy {
  timezone: string;
  studentStart: string;
  studentGrace: number;
  staffStart: string;
  staffGrace: number;
  closingTime: string;
  weekdays: number[];
  dateOverrides: Record<string, boolean>;
}
export interface DailyEntry {
  id: string;
  day_id: string;
  subject_id: string;
  subject_role: "student" | "tutor" | "admin";
  subject_name: string;
  class_names: string[];
  check_in: string | null;
  check_out: string | null;
  calculated_status: "pending" | "present" | "late" | "absent";
  late_seconds: number;
  excused: boolean;
  excuse_reason: string | null;
  revision: number;
  approval_status?: "pending" | "approved" | "rejected";
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_reason?: string | null;
}
export interface AttendanceDay {
  id: string;
  office_id: string;
  attendance_date: string;
  audience: "student" | "staff";
  policy_snapshot: AttendancePolicy;
  closes_at: string;
  finalized_at: string | null;
}
export interface AttendanceEvent {
  id: string;
  entry_id: string | null;
  action: string;
  actor_id: string | null;
  recorded_at: string;
  occurred_at: string | null;
  reason: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
}

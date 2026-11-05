export type AttendanceMark = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  date: string;
  courseTitle: string;
  courseCode: string;
  mark: AttendanceMark;
}

export interface AttendanceSummary {
  presentPercent: number;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

export interface AttendanceOverview {
  summary: AttendanceSummary;
  records: AttendanceRecord[];
}

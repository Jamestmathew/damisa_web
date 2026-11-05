export type AttendanceMark = "present" | "absent" | "late";

export interface AttendanceStudentRow {
  studentId: string;
  studentName: string;
  mark: AttendanceMark | null;
}

export interface AttendanceSession {
  courseId: string;
  courseCode: string;
  date: string;
  students: AttendanceStudentRow[];
}

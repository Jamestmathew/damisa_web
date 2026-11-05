import type { UserStatus } from "@/modules/admin/shared/types";

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  program: string;
  level: string;
  status: UserStatus;
  enrolledAt: string;
}

export interface StudentEnrollmentRecord {
  courseCode: string;
  courseTitle: string;
  progressPercent: number;
  grade: string;
}

export interface StudentAcademicSummary {
  gpa: number;
  creditsCompleted: number;
  creditsRequired: number;
}

export interface AdminStudentProfile extends AdminStudent {
  phone: string | null;
  enrollments: StudentEnrollmentRecord[];
  academicSummary: StudentAcademicSummary;
}

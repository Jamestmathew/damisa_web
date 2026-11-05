import type { ScheduleStatus } from "@/modules/student/shared/types";

export interface ExamSummary {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  durationMinutes: number;
  status: ScheduleStatus;
}

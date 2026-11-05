export type SubmissionStatus = "not_submitted" | "submitted" | "graded" | "late";
export type ScheduleStatus = "upcoming" | "ongoing" | "completed" | "missed";

export interface TutorCourseSummary {
  id: string;
  title: string;
  code: string;
  studentCount: number;
  moduleCount: number;
  status: "published" | "draft";
}

import type { CourseSummary, SubmissionStatus, ScheduleStatus } from "@/modules/student/shared/types";

export interface DashboardStat {
  label: string;
  value: string;
  hint?: string;
  icon: "courses" | "assignments" | "gpa" | "attendance";
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  courseTitle: string;
  dueAt: string;
  type: "assignment" | "quiz" | "exam";
}

export interface RecentAssignmentPreview {
  id: string;
  title: string;
  courseTitle: string;
  status: SubmissionStatus;
}

export interface RecentGradePreview {
  id: string;
  courseTitle: string;
  assessment: string;
  score: number;
  maxScore: number;
}

export interface AnnouncementPreview {
  id: string;
  title: string;
  courseTitle: string;
  postedAt: string;
}

export interface CalendarPreviewItem {
  id: string;
  title: string;
  time: string;
  status: ScheduleStatus;
}

export interface DashboardData {
  studentFirstName: string;
  stats: DashboardStat[];
  recentCourses: CourseSummary[];
  upcomingDeadlines: UpcomingDeadline[];
  recentAssignments: RecentAssignmentPreview[];
  recentGrades: RecentGradePreview[];
  announcements: AnnouncementPreview[];
  calendarPreview: CalendarPreviewItem[];
}

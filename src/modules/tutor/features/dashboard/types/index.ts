import type { SubmissionStatus, ScheduleStatus, TutorCourseSummary } from "@/modules/tutor/shared/types";

export interface TutorStat {
  label: string;
  value: string;
  hint?: string;
  icon: "courses" | "students" | "pending" | "quizzes";
}

export interface UpcomingClass {
  id: string;
  courseTitle: string;
  time: string;
  status: ScheduleStatus;
}

export interface RecentStudentActivity {
  id: string;
  studentName: string;
  action: string;
  courseTitle: string;
  occurredAt: string;
}

export interface PendingReview {
  id: string;
  studentName: string;
  assignmentTitle: string;
  courseTitle: string;
  status: SubmissionStatus;
}

export interface QuizStat {
  quizTitle: string;
  averageScorePercent: number;
  attemptCount: number;
}

export interface TutorAnnouncementPreview {
  id: string;
  title: string;
  postedAt: string;
}

export interface TutorDashboardData {
  tutorFirstName: string;
  stats: TutorStat[];
  myCourses: TutorCourseSummary[];
  upcomingClasses: UpcomingClass[];
  recentActivity: RecentStudentActivity[];
  pendingReviews: PendingReview[];
  quizStats: QuizStat[];
  attendanceRatePercent: number;
  announcements: TutorAnnouncementPreview[];
}

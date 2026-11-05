import "server-only";
import { listRecords } from "@/shared/data/records";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";
import {
  getTutorAssignments,
  type StoredSubmission,
} from "@/modules/tutor/features/assignments/services/assignments.service";
import { getTutorQuizzes } from "@/modules/tutor/features/quizzes/services/quizzes.service";
import { getTutorStudents } from "@/modules/tutor/features/students/services/students.service";
import type { TutorDashboardData } from "../types";
export async function getTutorDashboardData(
  tutorName: string,
): Promise<TutorDashboardData> {
  const [
    courses,
    assignments,
    quizzes,
    students,
    submissions,
    announcements,
    attendance,
    attempts,
  ] = await Promise.all([
    getTutorCourses(),
    getTutorAssignments(),
    getTutorQuizzes(),
    getTutorStudents(),
    listRecords<StoredSubmission>("submission"),
    listRecords<{ title: string; postedAt: string }>("announcement"),
    listRecords<{ mark: string }>("attendance"),
    listRecords<{ quizId: string; scorePercent: number }>("quiz_attempt"),
  ]);
  const pending = submissions.filter((s) => s.status !== "graded");
  return {
    tutorFirstName: tutorName.split(" ")[0] ?? tutorName,
    stats: [
      { label: "My Courses", value: String(courses.length), icon: "courses" },
      {
        label: "Total Students",
        value: String(new Set(students.map((s) => s.id.split(":")[0])).size),
        icon: "students",
      },
      {
        label: "Pending Reviews",
        value: String(pending.length),
        icon: "pending",
      },
      {
        label: "Active Quizzes",
        value: String(quizzes.length),
        icon: "quizzes",
      },
    ],
    myCourses: courses,
    upcomingClasses: [],
    recentActivity: submissions.slice(-5).map((s) => ({
      id: s.id,
      studentName: s.studentName,
      action: "submitted",
      courseTitle:
        assignments.find((a) => a.id === s.assignmentId)?.title ?? "Assignment",
      occurredAt: s.submittedAt ?? "",
    })),
    pendingReviews: pending.map((s) => ({
      id: s.assignmentId,
      studentName: s.studentName,
      assignmentTitle:
        assignments.find((a) => a.id === s.assignmentId)?.title ?? "Assignment",
      courseTitle: courses.find((c) => c.id === s.courseId)?.code ?? "",
      status: "submitted",
    })),
    quizStats: quizzes.map((q) => {
      const rows = attempts.filter((a) => a.quizId === q.id);
      return {
        quizTitle: q.title,
        attemptCount: rows.length,
        averageScorePercent: rows.length
          ? Math.round(
              rows.reduce((n, a) => n + a.scorePercent, 0) / rows.length,
            )
          : 0,
      };
    }),
    attendanceRatePercent: attendance.length
      ? Math.round(
          (attendance.filter((a) => a.mark !== "absent").length /
            attendance.length) *
            100,
        )
      : 0,
    announcements,
  };
}

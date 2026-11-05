import "server-only";
import { getCourses } from "@/modules/student/features/courses/services/courses.service";
import { getAssignments } from "@/modules/student/features/assignments/services/assignments.service";
import { getGradesOverview } from "@/modules/student/features/grades/services/grades.service";
import { getAttendanceOverview } from "@/modules/student/features/attendance/services/attendance.service";
import { getAnnouncements } from "@/modules/student/features/announcements/services/announcements.service";
import type { DashboardData } from "../types";
export async function getDashboardData(
  studentName: string,
): Promise<DashboardData> {
  const [courses, assignments, grades, attendance, announcements] =
    await Promise.all([
      getCourses(),
      getAssignments(),
      getGradesOverview(),
      getAttendanceOverview(),
      getAnnouncements(),
    ]);
  const pending = assignments.filter((a) => a.status === "not_submitted");
  return {
    studentFirstName: studentName.split(" ")[0] ?? studentName,
    stats: [
      {
        label: "Enrolled Courses",
        value: String(courses.length),
        icon: "courses",
      },
      {
        label: "Pending Assignments",
        value: String(pending.length),
        icon: "assignments",
      },
      {
        label: "Provisional GPA",
        value: grades.gpa.toFixed(2),
        hint: "Based on graded assessments",
        icon: "gpa",
      },
      {
        label: "Attendance Rate",
        value: `${attendance.summary.presentPercent}%`,
        icon: "attendance",
      },
    ],
    recentCourses: courses.slice(0, 4),
    upcomingDeadlines: pending.slice(0, 5).map((a) => ({
      id: a.id,
      title: a.title,
      courseTitle: a.courseTitle,
      dueAt: a.dueAt,
      type: "assignment",
    })),
    recentAssignments: assignments.slice(-5),
    recentGrades: grades.rows.slice(-5),
    announcements: announcements
      .slice(-5)
      .map((a) => ({ ...a, courseTitle: a.courseTitle ?? "Institution" })),
    calendarPreview: [],
  };
}

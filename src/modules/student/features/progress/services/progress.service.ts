import "server-only";
import { getCourses } from "@/modules/student/features/courses/services/courses.service";
import type { ProgressOverview } from "../types";
export async function getProgressOverview(): Promise<ProgressOverview> {
  const courses = (await getCourses()).map((c) => ({
    courseId: c.id,
    courseTitle: c.title,
    courseCode: c.code,
    progressPercent: c.progressPercent,
    lessonsCompleted: c.modules.reduce((n, m) => n + m.completedLessonCount, 0),
    lessonsTotal: c.modules.reduce((n, m) => n + m.lessonCount, 0),
  }));
  const total = courses.reduce((n, c) => n + c.lessonsTotal, 0);
  return {
    overallPercent: total
      ? Math.round(
          (courses.reduce((n, c) => n + c.lessonsCompleted, 0) / total) * 100,
        )
      : 0,
    courses,
    skills: [],
  };
}

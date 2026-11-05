import "server-only";
import { courseCoverUrl } from "@/shared/media/storage";
import { listRecords, getRecord, saveRecord } from "@/shared/data/records";
import type { TutorCourseDetails } from "@/modules/tutor/features/courses/types";
import type { AdminCourse } from "../types";
export async function getCourses(): Promise<AdminCourse[]> {
  const [courses, classes] = await Promise.all([
    listRecords<TutorCourseDetails>("course"),
    listRecords<{
      department: string;
      courseIds?: string[];
      studentIds?: string[];
    }>("class"),
  ]);
  return Promise.all(
    courses.map(async (c) => ({
      coverUrl: await courseCoverUrl(c.id, c.coverPath),
      id: c.id,
      title: c.title,
      code: c.code,
      department:
        classes.find((k) => k.courseIds?.includes(c.id))?.department ?? "",
      instructor: c.instructorName ?? "Course tutor",
      enrolledCount: new Set(
        classes
          .filter((k) => k.courseIds?.includes(c.id))
          .flatMap((k) => k.studentIds ?? []),
      ).size,
      status: c.status,
    })),
  );
}
export async function setCourseStatus(
  id: string,
  status: AdminCourse["status"],
) {
  const course = await getRecord<TutorCourseDetails>("course", id);
  if (!course) return { ok: false as const, error: "Course not found." };
  await saveRecord("course", { ...course, status }, id);
  return { ok: true as const };
}

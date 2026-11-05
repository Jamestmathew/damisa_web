import "server-only";
import { courseCoverUrl } from "@/shared/media/storage";
import { listRecords, getRecord } from "@/shared/data/records";
import type { TutorCourseDetails } from "@/modules/tutor/features/courses/types";
import type { TutorLesson } from "@/modules/tutor/features/lessons/types";
import type { CourseDetails } from "../types";
export async function getCourses() {
  const courses = await listRecords<TutorCourseDetails>("course");
  return Promise.all(courses.map((c) => getCourseById(c.id))).then((rows) =>
    rows.filter((c): c is CourseDetails => c !== null),
  );
}
export async function getCourseById(id: string): Promise<CourseDetails | null> {
  const course = await getRecord<TutorCourseDetails>("course", id);
  if (!course) return null;
  const lessons = (await listRecords<TutorLesson>("lesson")).filter(
    (l) => l.courseId === id,
  );
  const progress = await listRecords<{ lessonId: string }>("lesson_progress");
  const completed = new Set(progress.map((p) => p.lessonId));
  return {
    ...course,
    coverUrl: await courseCoverUrl(course.id, course.coverPath),
    instructor: course.instructorName ?? "Course tutor",
    instructorTitle: "Tutor",
    thumbnailColor: "bg-blue-500",
    progressPercent: lessons.length
      ? Math.round(
          (lessons.filter((l) => completed.has(l.id)).length / lessons.length) *
            100,
        )
      : 0,
    modules: [
      {
        id: "lessons",
        title: "Course lessons",
        lessonCount: lessons.length,
        completedLessonCount: lessons.filter((l) => completed.has(l.id)).length,
      },
    ],
  };
}

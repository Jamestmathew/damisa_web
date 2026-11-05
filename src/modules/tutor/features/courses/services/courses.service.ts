import "server-only";
import { getContext } from "@/shared/security/context";
import { listRecords, saveRecord } from "@/shared/data/records";
import type { TutorCourseDetails } from "../types";
export async function getTutorCourses() {
  const [courses, classes] = await Promise.all([
    listRecords<TutorCourseDetails>("course"),
    listRecords<{ courseIds?: string[]; studentIds?: string[] }>("class"),
  ]);
  return courses.map((course) => ({
    ...course,
    studentCount: new Set(
      classes
        .filter((c) => c.courseIds?.includes(course.id))
        .flatMap((c) => c.studentIds ?? []),
    ).size,
  }));
}
export async function getTutorCourseById(id: string) {
  return (await getTutorCourses()).find((c) => c.id === id) ?? null;
}
export async function createCourse(input: {
  title: string;
  code: string;
  description: string;
  creditUnits: number;
}) {
  if (
    (await getTutorCourses()).some(
      (c) => c.code.toLowerCase() === input.code.toLowerCase(),
    )
  )
    return {
      ok: false as const,
      error: "A course with this code already exists.",
    };
  const { user } = await getContext();
  const course = await saveRecord<TutorCourseDetails>("course", {
    ...input,
    instructorId: user.id,
    instructorName: user.name,
    assessmentPolicy: { caWeight: 30, examWeight: 70 },
    id: "",
    studentCount: 0,
    moduleCount: 0,
    status: "draft",
    modules: [],
  });
  return { ok: true as const, course };
}
export async function setCoursePublishStatus(
  id: string,
  status: "published" | "draft",
) {
  const course = await getTutorCourseById(id);
  if (!course) return { ok: false as const, error: "Course not found." };
  await saveRecord("course", { ...course, status }, id);
  return { ok: true as const };
}
export async function addCourseModule(id: string, title: string) {
  const course = await getTutorCourseById(id);
  if (!course) return { ok: false as const, error: "Course not found." };
  const modules = [
    ...course.modules,
    { id: crypto.randomUUID(), title, lessonCount: 0 },
  ];
  await saveRecord(
    "course",
    { ...course, modules, moduleCount: modules.length },
    id,
  );
  return { ok: true as const };
}

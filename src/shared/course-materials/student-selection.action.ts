"use server";
import { createHash } from "node:crypto";
import { authorizeAction } from "@/shared/security/action";
import { getRecord, listRecords, saveRecord } from "@/shared/data/records";
import type { TutorEnrollment } from "@/shared/data/tutor-enrollment";
import { revalidatePath } from "next/cache";
export async function saveCourseStudentsAction(
  courseId: string,
  studentIds: string[],
) {
  const user = await authorizeAction(["tutor"]);
  try {
    if (!(await getRecord("course", courseId)))
      throw new Error("Course not found.");
    const entries = await listRecords<TutorEnrollment>("class");
    const existing = entries.find(
      (e) =>
        e.type === "course_enrollment" &&
        e.tutorId === user.id &&
        e.courseIds?.includes(courseId),
    );
    const hash = createHash("sha256")
      .update(`course-enrollment:${user.id}:${courseId}`)
      .digest("hex");
    const id =
      existing?.id ??
      `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
    await saveRecord(
      "class",
      {
        ...existing,
        id,
        type: "course_enrollment",
        name: "Selected course students",
        tutorId: user.id,
        courseIds: [courseId],
        studentIds: [...new Set(studentIds)],
      },
      existing?.id,
    );
    revalidatePath("/", "layout");
    return { ok: true, error: "" };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Unable to select students.",
    };
  }
}

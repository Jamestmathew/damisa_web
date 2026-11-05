"use server";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { getRecord, saveRecord } from "@/shared/data/records";
import { getContext } from "@/shared/security/context";
import { uploadImage, removeImage } from "@/shared/media/storage";
import type { TutorCourseDetails } from "@/modules/tutor/features/courses/types";
export async function updateCourseCoverAction(data: FormData) {
  await authorizeAction(["admin"]);
  const id = String(data.get("courseId") ?? "");
  const course = await getRecord<TutorCourseDetails>("course", id);
  if (!course) return { ok: false as const, error: "Course not found." };
  const file = data.get("cover");
  if (!(file instanceof File) || !file.size)
    return { ok: false as const, error: "Choose a picture." };
  const { officeId } = await getContext();
  let path: string | undefined;
  try {
    path = await uploadImage(file, `${officeId}/courses/${id}`);
    await saveRecord("course", { ...course, coverPath: path }, id);
    if (course.coverPath) await removeImage(course.coverPath).catch(() => {});
    revalidatePath("/admin/courses");
    revalidatePath("/student/courses");
    revalidatePath("/tutor/courses");
    return { ok: true as const };
  } catch (error) {
    if (path) await removeImage(path).catch(() => {});
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Unable to upload picture.",
    };
  }
}

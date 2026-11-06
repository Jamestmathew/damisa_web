"use server";
import { authorizeAction } from "@/shared/security/action";
import { revalidatePath } from "next/cache";
import {
  beginCourseUpload,
  completeCourseUpload,
  removeCourseMaterial,
} from "./service";
export async function startMaterialUploadAction(
  courseId: string,
  name: string,
  size: number,
) {
  await authorizeAction(["admin", "tutor"]);
  try {
    return {
      ok: true as const,
      ...(await beginCourseUpload(courseId, name, size)),
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unable to start upload.",
    };
  }
}
export async function completeMaterialUploadAction(
  courseId: string,
  id: string,
) {
  await authorizeAction(["admin", "tutor"]);
  try {
    await completeCourseUpload(courseId, id);
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Unable to finish upload.",
    };
  }
}
export async function removeMaterialAction(courseId: string, id: string) {
  await authorizeAction(["admin", "tutor"]);
  try {
    await removeCourseMaterial(courseId, id);
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unable to remove file.",
    };
  }
}

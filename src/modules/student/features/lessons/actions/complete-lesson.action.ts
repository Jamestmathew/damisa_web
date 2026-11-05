"use server";
import { authorizeAction } from "@/shared/security/action";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/shared/rbac";
import { completeLesson } from "../services/lessons.service";
export async function completeLessonAction(courseId: string, lessonId: string) {
  await authorizeAction(["student"]);
  await requireRole(["student"]);
  await completeLesson(courseId, lessonId);
  revalidatePath("/student", "layout");
}

"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { examFormSchema } from "../validation/exam-form.schema";
import { scheduleExam, deleteExam } from "../services/exams.service";
import type { ExamActionResult } from "../types";

export async function scheduleExamAction(
  _prevState: ExamActionResult | null,
  formData: FormData,
): Promise<ExamActionResult> {
  await authorizeAction(["tutor"]);
  await requirePermission("exams:manage_own");

  const parsed = examFormSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    date: formData.get("date"),
    time: formData.get("time"),
    venue: formData.get("venue"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "Please fix the errors below",
      fieldErrors: {
        courseId: fieldErrors.courseId?.[0],
        title: fieldErrors.title?.[0],
        date: fieldErrors.date?.[0],
        time: fieldErrors.time?.[0],
        venue: fieldErrors.venue?.[0],
        durationMinutes: fieldErrors.durationMinutes?.[0],
      },
    };
  }

  const result = await scheduleExam(parsed.data);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(TUTOR_ROUTES.exams);
  return { ok: true, message: "Exam scheduled." };
}

export async function deleteExamAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("exams:manage_own");

  const result = await deleteExam(id);
  if (result.ok) revalidatePath(TUTOR_ROUTES.exams);

  return result;
}

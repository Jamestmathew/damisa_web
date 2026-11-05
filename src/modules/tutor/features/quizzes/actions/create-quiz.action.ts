"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { quizFormSchema } from "../validation/quiz-form.schema";
import { createQuiz } from "../services/quizzes.service";
import type { QuizActionResult } from "../types";

export async function createQuizAction(
  payload: unknown,
): Promise<QuizActionResult> {
  await authorizeAction(["tutor"]);
  await requirePermission("quizzes:manage_own");

  const parsed = quizFormSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors in your quiz before saving.",
    };
  }

  const result = await createQuiz(parsed.data);

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(TUTOR_ROUTES.quizzes);
  return { ok: true, message: "Quiz created." };
}

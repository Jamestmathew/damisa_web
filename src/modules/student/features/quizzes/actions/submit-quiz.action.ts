"use server";
import { authorizeAction } from "@/shared/security/action";
import { requireRole } from "@/shared/rbac";

import { revalidatePath } from "next/cache";

import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import { quizAttemptSchema } from "../validation/quiz-attempt.schema";
import { submitQuizAttempt } from "../services/quizzes.service";
import type { QuizResult } from "../types";

export type QuizActionResult =
  | { ok: true; data: QuizResult }
  | { ok: false; error: string };

export async function submitQuizAction(
  quizId: string,
  answers: Record<string, string>,
): Promise<QuizActionResult> {
  await authorizeAction(["student"]);
  await requireRole(["student"]);
  try {
    const parsed = quizAttemptSchema.safeParse({ quizId, answers });

    if (!parsed.success) {
      return {
        ok: false,
        error: "Please answer every question before submitting.",
      };
    }

    const result = await submitQuizAttempt(
      parsed.data.quizId,
      parsed.data.answers,
    );

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    revalidatePath(STUDENT_ROUTES.quizAttempt(quizId));

    return {
      ok: true,
      data: {
        quizId,
        scorePercent: result.scorePercent,
        correctCount: result.correctCount,
        totalCount: result.totalCount,
      },
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

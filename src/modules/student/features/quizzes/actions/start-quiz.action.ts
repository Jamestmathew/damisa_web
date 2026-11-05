"use server";
import { authorizeAction } from "@/shared/security/action";
import { startQuiz } from "../services/quizzes.service";
export async function startQuizAction(quizId: string) {
  await authorizeAction(["student"]);
  try {
    return { ok: true as const, expiresAt: await startQuiz(quizId) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unable to start quiz.",
    };
  }
}

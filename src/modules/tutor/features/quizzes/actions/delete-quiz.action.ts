"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { deleteQuiz } from "../services/quizzes.service";

export async function deleteQuizAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("quizzes:manage_own");

  const result = await deleteQuiz(id);

  if (result.ok) revalidatePath(TUTOR_ROUTES.quizzes);

  return result;
}

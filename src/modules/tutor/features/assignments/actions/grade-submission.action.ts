"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { gradeSubmissionSchema } from "../validation/assignment.schema";
import { gradeSubmission } from "../services/assignments.service";

export async function gradeSubmissionAction(
  assignmentId: string,
  submissionId: string,
  score: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("gradebook:manage_own");

  const parsed = gradeSubmissionSchema.safeParse({ submissionId, score });
  if (!parsed.success) return { ok: false, error: "Invalid score." };

  const result = await gradeSubmission(
    parsed.data.submissionId,
    parsed.data.score,
  );

  if (result.ok) {
    revalidatePath(TUTOR_ROUTES.assignmentSubmissions(assignmentId));
  }

  return result;
}

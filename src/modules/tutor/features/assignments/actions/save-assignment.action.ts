"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { assignmentFormSchema } from "../validation/assignment.schema";
import {
  createAssignment,
  updateAssignment,
} from "../services/assignments.service";
import type { AssignmentActionResult } from "../types";

export async function saveAssignmentAction(
  _prevState: AssignmentActionResult | null,
  formData: FormData,
): Promise<AssignmentActionResult> {
  await authorizeAction(["tutor"]);
  await requirePermission("assignments:manage_own");

  try {
    const parsed = assignmentFormSchema.safeParse({
      id: formData.get("id") || undefined,
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      instructions: formData.get("instructions"),
      dueAt: formData.get("dueAt"),
      maxScore: formData.get("maxScore"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          courseId: fieldErrors.courseId?.[0],
          title: fieldErrors.title?.[0],
          dueAt: fieldErrors.dueAt?.[0],
          maxScore: fieldErrors.maxScore?.[0],
        },
      };
    }

    const { id, courseId, ...input } = parsed.data;
    const result = id
      ? await updateAssignment(id, input)
      : await createAssignment({ courseId, ...input });

    if (!result.ok) return { ok: false, error: result.error };

    revalidatePath(TUTOR_ROUTES.assignments);
    return {
      ok: true,
      message: id ? "Assignment updated." : "Assignment created.",
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

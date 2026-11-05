"use server";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { assignmentSubmissionSchema } from "../validation/submission.schema";
import {
  getAssignmentById,
  submitAssignmentAnswer,
} from "../services/assignments.service";
import {
  uploadSubmissionFiles,
  removeSubmissionFiles,
} from "@/shared/files/submission-storage";
import type { SubmissionFile } from "@/shared/files/assignment-files";
import type { AssignmentActionResult } from "../types";
export async function submitAssignmentAction(
  _previous: AssignmentActionResult | null,
  data: FormData,
): Promise<AssignmentActionResult> {
  await authorizeAction(["student"]);
  let uploaded: SubmissionFile[] = [];
  try {
    const assignmentId = String(data.get("assignmentId") ?? "");
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) return { ok: false, error: "Assignment not found." };
    if (assignment.status === "graded")
      return { ok: false, error: "A graded submission cannot be replaced." };
    if (Date.parse(assignment.dueAt) < Date.now())
      return { ok: false, error: "The submission deadline has passed." };
    const files = data
      .getAll("attachments")
      .filter(
        (value): value is File => value instanceof File && value.size > 0,
      );
    const parsed = assignmentSubmissionSchema.safeParse({
      assignmentId,
      submissionText: data.get("submissionText") ?? "",
      attachmentCount: files.length || (assignment.attachments?.length ?? 0),
    });
    if (!parsed.success)
      return {
        ok: false,
        error: "Write at least 20 characters or attach up to five files.",
        fieldErrors: {
          submissionText:
            parsed.error.flatten().fieldErrors.submissionText?.[0],
        },
      };
    if (files.length)
      uploaded = await uploadSubmissionFiles(assignmentId, files);
    const result = await submitAssignmentAnswer(
      assignmentId,
      parsed.data.submissionText,
      files.length ? uploaded : assignment.attachments,
    );
    if (!result.ok) {
      if (uploaded.length) await removeSubmissionFiles(uploaded);
      return { ok: false, error: result.error };
    }
    if (uploaded.length && assignment.attachments?.length)
      await removeSubmissionFiles(assignment.attachments);
    revalidatePath("/student/assignments");
    revalidatePath(`/student/assignments/${assignmentId}`);
    revalidatePath("/tutor/assignments");
    return { ok: true, message: "Your submission has been recorded." };
  } catch (error) {
    if (uploaded.length) await removeSubmissionFiles(uploaded);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit the assignment.",
    };
  }
}

import type { SubmissionFile } from "@/shared/files/assignment-files";
import "server-only";
import { listRecords, getRecord, saveRecord } from "@/shared/data/records";
import { getContext } from "@/shared/security/context";
import type {
  StoredAssignment,
  StoredSubmission,
} from "@/modules/tutor/features/assignments/services/assignments.service";
import type { AssignmentDetails, AssignmentSummary } from "../types";
export async function getAssignmentById(
  id: string,
): Promise<AssignmentDetails | null> {
  const assignment = await getRecord<StoredAssignment>("assignment", id);
  if (!assignment) return null;
  const submission = (await listRecords<StoredSubmission>("submission")).find(
    (s) => s.assignmentId === id,
  );
  return {
    id,
    courseId: assignment.courseId,
    courseTitle: assignment.courseCode,
    title: assignment.title,
    dueAt: assignment.dueAt,
    maxScore: assignment.maxScore,
    instructions: assignment.instructions,
    status:
      submission?.status === "graded"
        ? "graded"
        : submission
          ? "submitted"
          : "not_submitted",
    submissionText: submission?.submissionText ?? null,
    submittedAt: submission?.submittedAt ?? null,
    score: submission?.score ?? null,
    feedback: submission?.feedback ?? null,
    submissionId: submission?.id ?? null,
    attachments: submission?.attachments ?? [],
  };
}
export async function getAssignments(): Promise<AssignmentSummary[]> {
  return (
    await Promise.all(
      (await listRecords<StoredAssignment>("assignment")).map((a) =>
        getAssignmentById(a.id),
      ),
    )
  ).filter((a): a is AssignmentDetails => a !== null);
}
export async function submitAssignmentAnswer(
  assignmentId: string,
  submissionText: string,
  attachments?: SubmissionFile[],
) {
  const { user } = await getContext();
  const assignment = await getRecord<StoredAssignment>(
    "assignment",
    assignmentId,
  );
  if (!assignment)
    return { ok: false as const, error: "Assignment not found." };
  const due = Date.parse(assignment.dueAt);
  if (Number.isFinite(due) && due < Date.now())
    return { ok: false as const, error: "The submission deadline has passed." };
  const existing = (await listRecords<StoredSubmission>("submission")).find(
    (s) => s.assignmentId === assignmentId,
  );
  if (existing?.status === "graded")
    return {
      ok: false as const,
      error: "A graded submission cannot be replaced.",
    };
  if (
    (!submissionText.trim() &&
      !attachments?.length &&
      !existing?.attachments?.length) ||
    submissionText.length > 50000
  )
    return {
      ok: false as const,
      error: "Enter a submission of up to 50,000 characters.",
    };
  await saveRecord<StoredSubmission>(
    "submission",
    {
      id: existing?.id ?? "",
      assignmentId,
      courseId: assignment.courseId,
      studentId: user.id,
      studentName: user.name,
      submissionText,
      attachments: attachments ?? existing?.attachments ?? [],
      submittedAt: new Date().toISOString(),
      score: null,
      status: "submitted",
    },
    existing?.id,
  );
  return { ok: true as const };
}

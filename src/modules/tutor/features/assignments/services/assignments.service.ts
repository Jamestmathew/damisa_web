import "server-only";
import { normalizeDeadline } from "@/shared/security/policy";
import { listRecords, getRecord, saveRecord } from "@/shared/data/records";
import { getTutorCourseById } from "@/modules/tutor/features/courses/services/courses.service";
import type { AssignmentSubmission, TutorAssignment } from "../types";
export interface StoredAssignment extends TutorAssignment {
  instructions: string;
}
export interface StoredSubmission extends AssignmentSubmission {
  studentId: string;
  courseId: string;
  feedback?: string;
}
export async function getTutorAssignments(): Promise<TutorAssignment[]> {
  const submissions = await listRecords<StoredSubmission>("submission");
  return (await listRecords<StoredAssignment>("assignment")).map((a) => ({
    ...a,
    submittedCount: submissions.filter((s) => s.assignmentId === a.id).length,
    gradedCount: submissions.filter(
      (s) => s.assignmentId === a.id && s.status === "graded",
    ).length,
  }));
}
export async function getSubmissionsByAssignment(assignmentId: string) {
  return (await listRecords<StoredSubmission>("submission")).filter(
    (s) => s.assignmentId === assignmentId,
  );
}
export async function createAssignment(input: {
  courseId: string;
  title: string;
  dueAt: string;
  maxScore: number;
  instructions?: string;
}) {
  const course = await getTutorCourseById(input.courseId);
  if (!course) return { ok: false as const, error: "Course not found." };
  await saveRecord<StoredAssignment>("assignment", {
    ...input,
    dueAt: normalizeDeadline(input.dueAt),
    instructions: input.instructions ?? input.title,
    id: "",
    courseCode: course.code,
    submittedCount: 0,
    gradedCount: 0,
    totalStudents: course.studentCount,
  });
  return { ok: true as const };
}
export async function updateAssignment(
  id: string,
  input: {
    title: string;
    dueAt: string;
    maxScore: number;
    instructions?: string;
  },
) {
  const assignment = await getRecord<StoredAssignment>("assignment", id);
  if (!assignment)
    return { ok: false as const, error: "Assignment not found." };
  await saveRecord(
    "assignment",
    { ...assignment, ...input, dueAt: normalizeDeadline(input.dueAt) },
    id,
  );
  return { ok: true as const };
}
export async function gradeSubmission(id: string, score: number) {
  const submission = await getRecord<StoredSubmission>("submission", id);
  const assignment =
    submission &&
    (await getRecord<StoredAssignment>("assignment", submission.assignmentId));
  if (!submission || !assignment)
    return { ok: false as const, error: "Submission not found." };
  if (!Number.isFinite(score) || score < 0 || score > assignment.maxScore)
    return {
      ok: false as const,
      error: `Score must be between 0 and ${assignment.maxScore}.`,
    };
  await saveRecord(
    "submission",
    { ...submission, score, status: "graded" },
    id,
  );
  return { ok: true as const };
}

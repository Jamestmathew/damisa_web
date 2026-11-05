import "server-only";
import { listRecords } from "@/shared/data/records";
import type {
  StoredAssignment,
  StoredSubmission,
} from "@/modules/tutor/features/assignments/services/assignments.service";
import type { Attempt } from "@/modules/student/features/quizzes/services/quizzes.service";
import type { AssessmentMark } from "./grading";
export async function loadAssessmentMarks(): Promise<AssessmentMark[]> {
  const [assignments, submissions, attempts, manual] = await Promise.all([
    listRecords<StoredAssignment>("assignment"),
    listRecords<StoredSubmission>("submission"),
    listRecords<Attempt>("quiz_attempt"),
    listRecords<AssessmentMark>("assessment_grade"),
  ]);
  const marks: AssessmentMark[] = [...manual];
  for (const s of submissions) {
    const assignment = assignments.find((a) => a.id === s.assignmentId);
    if (s.status === "graded" && s.score !== null && assignment?.maxScore)
      marks.push({
        id: s.id,
        studentId: s.studentId,
        courseId: s.courseId,
        title: assignment.title,
        category: "ca",
        score: s.score,
        maxScore: assignment.maxScore,
        source: "assignment",
      });
  }
  const best = new Map<string, Attempt & { id: string }>();
  for (const attempt of attempts) {
    const key = `${attempt.studentId}:${attempt.quizId}`;
    if (!best.has(key) || best.get(key)!.scorePercent < attempt.scorePercent)
      best.set(key, attempt);
  }
  for (const a of best.values())
    marks.push({
      id: a.id,
      studentId: a.studentId,
      courseId: a.courseId,
      title: "Quiz",
      category: "ca",
      score: a.correctCount,
      maxScore: a.totalCount,
      source: "quiz",
    });
  return marks;
}

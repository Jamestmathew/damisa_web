import "server-only";
import { listRecords, getRecord, saveRecord } from "@/shared/data/records";
import { getContext } from "@/shared/security/context";
import { gradeAnswers } from "@/shared/security/policy";
import type { TutorQuiz } from "@/modules/tutor/features/quizzes/types";
import type { QuizDetails, QuizSummary } from "../types";
export interface Attempt {
  studentId: string;
  quizId: string;
  courseId: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  submittedAt: string;
}
export async function getQuizById(id: string): Promise<QuizDetails | null> {
  const quiz = await getRecord<TutorQuiz>("quiz", id);
  if (!quiz) return null;
  const attempts = (await listRecords<Attempt>("quiz_attempt")).filter(
    (a) => a.quizId === id,
  );
  return {
    id,
    courseId: quiz.courseId,
    courseTitle: quiz.courseCode,
    title: quiz.title,
    durationMinutes: quiz.durationMinutes,
    dueAt: "",
    status: attempts.length ? "completed" : "not_started",
    bestScorePercent: attempts.length
      ? Math.max(...attempts.map((a) => a.scorePercent))
      : null,
    questionCount: quiz.questions.length,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options.map((label, index) => ({ id: String(index), label })),
    })),
  };
}
export async function getQuizzes(): Promise<QuizSummary[]> {
  const quizzes = await listRecords<TutorQuiz>("quiz");
  return (await Promise.all(quizzes.map((q) => getQuizById(q.id))))
    .filter((q): q is QuizDetails => q !== null)
    .map(({ questions, ...q }) => q);
}
export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>,
) {
  const quiz = await getRecord<TutorQuiz>("quiz", quizId);
  if (!quiz) return { ok: false as const, error: "Quiz not found." };
  const existing = (await listRecords<Attempt>("quiz_attempt")).find(
    (a) => a.quizId === quizId,
  );
  if (existing)
    return {
      ok: true as const,
      scorePercent: existing.scorePercent,
      correctCount: existing.correctCount,
      totalCount: existing.totalCount,
    };
  const session = (
    await listRecords<{ quizId: string; expiresAt: string }>("quiz_session")
  ).find((s) => s.quizId === quizId);
  if (!session || Date.parse(session.expiresAt) < Date.now())
    return {
      ok: false as const,
      error: "Your quiz session has expired or has not started.",
    };
  const { user } = await getContext();
  try {
    const result = gradeAnswers(quiz.questions, answers);
    await saveRecord<Attempt>("quiz_attempt", {
      quizId,
      studentId: user.id,
      courseId: quiz.courseId,
      ...result,
      submittedAt: new Date().toISOString(),
    });
    return { ok: true as const, ...result };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unable to submit quiz.",
    };
  }
}

export async function startQuiz(quizId: string) {
  const quiz = await getRecord<TutorQuiz>("quiz", quizId);
  if (!quiz) throw new Error("Quiz not found.");
  const existing = (
    await listRecords<{ quizId: string; expiresAt: string }>("quiz_session")
  ).find((s) => s.quizId === quizId);
  if (existing) {
    if (Date.parse(existing.expiresAt) < Date.now())
      throw new Error("Your quiz time has expired. Contact your tutor.");
    return existing.expiresAt;
  }
  const expiresAt = new Date(
    Date.now() + quiz.durationMinutes * 60000,
  ).toISOString();
  await saveRecord("quiz_session", {
    quizId,
    courseId: quiz.courseId,
    expiresAt,
  });
  return expiresAt;
}

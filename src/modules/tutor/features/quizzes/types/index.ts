export interface QuizQuestionDraft {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
}

export interface TutorQuiz {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  durationMinutes: number;
  attemptCount: number;
  averageScorePercent: number | null;
  questions: QuizQuestionDraft[];
}

export type QuizActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

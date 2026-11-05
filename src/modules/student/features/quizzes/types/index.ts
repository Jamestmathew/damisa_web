export type QuizAttemptStatus = "not_started" | "in_progress" | "completed";

export interface QuizSummary {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
  dueAt: string;
  status: QuizAttemptStatus;
  bestScorePercent: number | null;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
}

export interface QuizDetails extends QuizSummary {
  questions: QuizQuestion[];
}

export interface QuizResult {
  quizId: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
}

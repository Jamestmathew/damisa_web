export interface TutorExam {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  durationMinutes: number;
}

export type ExamActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

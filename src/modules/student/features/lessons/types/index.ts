export type LessonContentType = "video" | "reading" | "resource";

export interface LessonSummary {
  id: string;
  moduleId: string;
  title: string;
  contentType: LessonContentType;
  durationMinutes: number;
  completed: boolean;
}

export interface LessonDetails extends LessonSummary {
  courseId: string;
  courseTitle: string;
  body: string;
  nextLessonId: string | null;
  previousLessonId: string | null;
}

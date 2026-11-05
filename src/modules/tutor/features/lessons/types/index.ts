export type LessonContentType = "video" | "reading" | "resource";

export interface TutorLesson {
  id: string;
  courseId: string;
  moduleTitle: string;
  title: string;
  contentType: LessonContentType;
  durationMinutes: number;
  body: string;
  published: boolean;
}

export type LessonActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

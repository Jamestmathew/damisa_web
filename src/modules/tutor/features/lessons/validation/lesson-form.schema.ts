import { z } from "zod";

export const lessonFormSchema = z.object({
  id: z.string().optional(),
  courseId: z.string().min(1),
  title: z.string().min(3, "Title must be at least 3 characters"),
  contentType: z.enum(["video", "reading", "resource"]),
  durationMinutes: z.coerce
    .number<number>()
    .int()
    .min(1, "Must be at least 1 minute"),
  body: z.string().min(10, "Content must be at least 10 characters"),
});

export type LessonFormSchema = z.infer<typeof lessonFormSchema>;

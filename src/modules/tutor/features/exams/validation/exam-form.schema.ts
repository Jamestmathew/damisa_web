import { z } from "zod";

export const examFormSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  venue: z.string().min(2, "Venue is required"),
  durationMinutes: z.coerce
    .number<number>()
    .int()
    .min(15, "Must be at least 15 minutes"),
});

export type ExamFormSchema = z.infer<typeof examFormSchema>;

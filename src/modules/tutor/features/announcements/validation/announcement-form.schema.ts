import { z } from "zod";

export const tutorAnnouncementFormSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Message must be at least 10 characters"),
});

export type TutorAnnouncementFormSchema = z.infer<typeof tutorAnnouncementFormSchema>;

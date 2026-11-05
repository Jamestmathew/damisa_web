import { z } from "zod";

export const announcementFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Message must be at least 10 characters"),
  audience: z.enum(["everyone", "students", "tutors", "admins"]),
});

export type AnnouncementFormSchema = z.infer<typeof announcementFormSchema>;

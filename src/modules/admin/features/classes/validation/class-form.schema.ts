import { parseClassSchedule } from "@/shared/security/policy";
import { z } from "zod";

export const classFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().min(1, "Department is required"),
  teacher: z.string().min(2, "Teacher is required"),
  schedule: z
    .string()
    .refine(
      (v) => parseClassSchedule(v) !== null,
      "Use Mon & Wed, 09:00-10:00 | Main Hall (24-hour time).",
    ),
});

export type ClassFormSchema = z.infer<typeof classFormSchema>;

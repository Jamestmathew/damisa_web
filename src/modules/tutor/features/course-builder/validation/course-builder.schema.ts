import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(12, "Code is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  creditUnits: z.coerce
    .number<number>()
    .int()
    .min(1, "Must be at least 1 unit")
    .max(10, "Too many units"),
});

export type CreateCourseSchema = z.infer<typeof createCourseSchema>;

export const addModuleSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(3, "Module title must be at least 3 characters"),
});

export type AddModuleSchema = z.infer<typeof addModuleSchema>;

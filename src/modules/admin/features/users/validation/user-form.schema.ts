import { isMatricIdentifier } from "@/shared/security/policy";
import { z } from "zod";

export const userFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .email("Enter a valid email address")
      .optional()
      .or(z.literal("")),
    role: z.enum(["student", "tutor"]),
    matricNumber: z
      .string()
      .trim()
      .refine(
        (v) => !v || isMatricIdentifier(v),
        "Use letters, numbers, spaces, slash, dot, underscore, or hyphen.",
      )
      .optional(),
    staffId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "student" && !data.matricNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["matricNumber"],
        message: "Matric number is required for students",
      });
    }

    if (data.role === "tutor" && !data.email?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email is required for tutors",
      });
    }
  });

export type UserFormSchema = z.infer<typeof userFormSchema>;

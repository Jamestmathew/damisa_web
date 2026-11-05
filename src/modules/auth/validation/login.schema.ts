import { z } from "zod";

export const loginSchema = z.object({
  // Students sign in with a matric number, Tutors/Admins with email — so
  // this can't be a strict email() check; the auth service resolves
  // whichever form was entered.
  identifier: z.string().min(1, "Email or matric number is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginSchema = z.infer<typeof loginSchema>;

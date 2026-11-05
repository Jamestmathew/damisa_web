import { z } from "zod";

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Missing verification token"),
});

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;

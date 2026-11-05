import { z } from "zod";

export const quizAttemptSchema = z.object({
  quizId: z.string().min(1),
  answers: z
    .record(z.string(), z.string().min(1, "Please select an answer"))
    .refine((answers) => Object.keys(answers).length > 0, {
      message: "Please answer at least one question",
    }),
});

export type QuizAttemptSchema = z.infer<typeof quizAttemptSchema>;

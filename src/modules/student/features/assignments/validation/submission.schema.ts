import { z } from "zod";
export const assignmentSubmissionSchema = z
  .object({
    assignmentId: z.string().min(1),
    submissionText: z.string().max(10000, "Your submission is too long"),
    attachmentCount: z.number().int().min(0).max(5),
  })
  .refine(
    (v) => v.submissionText.trim().length >= 20 || v.attachmentCount > 0,
    {
      message: "Write at least 20 characters or attach a file.",
      path: ["submissionText"],
    },
  );
export type AssignmentSubmissionSchema = z.infer<
  typeof assignmentSubmissionSchema
>;

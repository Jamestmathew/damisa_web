import { normalizeDeadline } from "@/shared/security/policy";
import { z } from "zod";

export const assignmentFormSchema = z.object({
  id: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  dueAt: z.string().refine((v) => {
    try {
      normalizeDeadline(v);
      return true;
    } catch {
      return false;
    }
  }, "Choose a valid due date and time."),
  instructions: z.string().min(3, "Instructions are required").max(20000),
  maxScore: z.coerce.number<number>().int().min(1, "Must be at least 1 point"),
});

export type AssignmentFormSchema = z.infer<typeof assignmentFormSchema>;

export const gradeSubmissionSchema = z.object({
  submissionId: z.string().min(1),
  score: z.coerce.number<number>().min(0, "Score cannot be negative"),
});

export type GradeSubmissionSchema = z.infer<typeof gradeSubmissionSchema>;

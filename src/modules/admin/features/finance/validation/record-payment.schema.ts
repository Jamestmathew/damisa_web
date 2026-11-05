import { z } from "zod";

export const recordPaymentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().uuid().or(z.literal("")),
  earnedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose an income date")
    .refine((v) => Number.isFinite(Date.parse(v)), "Choose a valid date"),
  payerName: z.string().min(2, "Company name must be at least 2 characters"),
  payerEmail: z.string().email("Enter a valid email address").or(z.literal("")),
  purpose: z.string().min(2, "Purpose is required"),
  amountNaira: z.coerce
    .number<number>()
    .finite()
    .positive("Amount must be greater than zero")
    .max(1e12)
    .multipleOf(0.01),
  reference: z.string().min(2, "Reference is required"),
});

export type RecordPaymentSchema = z.infer<typeof recordPaymentSchema>;

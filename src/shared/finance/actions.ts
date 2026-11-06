"use server";
import { z } from "zod";
import { authorizeAction } from "@/shared/security/action";
import { revalidatePath } from "next/cache";
import { recordDirectStudentReceipt, recordOfficeExpense } from "./service";
const amount = z.coerce
  .number<number>()
  .finite()
  .positive()
  .max(1e12)
  .multipleOf(0.01);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      Number.isFinite(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
  );
const reference = z.string().trim().min(2).max(100);
function refresh() {
  for (const path of [
    "/admin/finance",
    "/super-admin/finance",
    "/super-admin/dashboard",
    "/student/payments",
  ])
    revalidatePath(path);
}
export async function recordSuperReceiptAction(data: FormData) {
  await authorizeAction(["super_admin"]);
  const parsed = z
    .object({
      studentId: z.string().uuid(),
      amountNaira: amount,
      reference,
      earnedOn: date,
      purpose: z.string().trim().min(2).max(300),
    })
    .safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return {
      ok: false,
      error:
        "Choose a student and enter a valid amount, date, purpose and reference.",
    };
  try {
    await recordDirectStudentReceipt(parsed.data);
    refresh();
    return { ok: true, error: "" };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to save receipt.",
    };
  }
}
export async function recordExpenseAction(data: FormData) {
  await authorizeAction(["admin"]);
  const parsed = z
    .object({
      amountNaira: amount,
      reference,
      spentOn: date,
      description: z.string().trim().min(2).max(500),
    })
    .safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return {
      ok: false,
      error: "Enter a valid expense amount, date, description and reference.",
    };
  try {
    await recordOfficeExpense(parsed.data);
    refresh();
    return { ok: true, error: "" };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to save expense.",
    };
  }
}

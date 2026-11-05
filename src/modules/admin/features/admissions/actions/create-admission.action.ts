"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { saveRecord } from "@/shared/data/records";
const schema = z.object({
  applicantName: z.string().trim().min(2).max(150),
  email: z.string().email(),
  program: z.string().trim().min(2).max(150),
  session: z.string().trim().min(4).max(30),
});
export async function createAdmissionAction(data: FormData) {
  await authorizeAction(["admin"]);
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Enter a name, valid email, program, and academic session.",
    };
  await saveRecord("admission", {
    ...parsed.data,
    status: "pending",
    submittedAt: new Date().toISOString(),
  });
  revalidatePath("/admin/admissions");
  return { ok: true as const };
}

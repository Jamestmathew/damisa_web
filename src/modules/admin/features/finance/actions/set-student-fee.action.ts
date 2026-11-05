"use server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { getOfficePeople } from "@/shared/data/people";
import { listRecords, saveRecord } from "@/shared/data/records";
import { getContext } from "@/shared/security/context";
import type { StudentFee } from "@/shared/data/balance";
const schema = z.object({
  studentId: z.string().uuid(),
  totalDueNaira: z.coerce.number<number>().finite().min(0).max(1e12),
  description: z.string().trim().min(2).max(200),
});
export async function setStudentFeeAction(data: FormData) {
  await authorizeAction(["admin"]);
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Choose a student and enter a valid total fee and description.",
    };
  const person = (await getOfficePeople()).find(
    (p) => p.id === parsed.data.studentId && p.role === "student",
  );
  if (!person)
    return { ok: false as const, error: "Student not found in your office." };
  const existing = (await listRecords<StudentFee>("student_fee")).find(
    (f) => f.studentId === person.id,
  );
  const { officeId } = await getContext();
  const hash = createHash("sha256")
    .update(`student-fee:${officeId}:${person.id}`)
    .digest("hex");
  const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  await saveRecord(
    "student_fee",
    { ...existing, ...parsed.data, id: existing?.id ?? id },
    existing?.id,
  );
  revalidatePath("/admin/finance");
  revalidatePath("/student/payments");
  revalidatePath("/super-admin/students");
  return { ok: true as const };
}

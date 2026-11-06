import "server-only";
import { createHash } from "node:crypto";
import { requireRole } from "@/shared/rbac";
import { createAdminClient } from "@/supabase/admin";
import { collectRows } from "@/shared/data/pagination";
import { ledgerStudentBalance, type Expense } from "./model";
import type { StudentFee } from "@/shared/data/balance";
import type { PaymentRecord } from "@/modules/admin/features/finance/types";
export function financialRecordId(
  kind: string,
  officeId: string,
  reference: string,
) {
  const h = createHash("sha256")
    .update(`${kind}:${officeId}:${reference.trim().toLowerCase()}`)
    .digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}
export async function getFinancialLedger(selectedOffice?: string) {
  const actor = await requireRole(["admin", "super_admin"]);
  const officeId = actor.role === "admin" ? actor.officeId : selectedOffice;
  if (
    actor.role === "admin" &&
    (!officeId || (selectedOffice && selectedOffice !== officeId))
  )
    throw new Error("Office access denied.");
  const db = createAdminClient();
  let recordsQuery = db
    .from("lms_records")
    .select("id,kind,office_id,owner_id,payload")
    .in("kind", ["payment", "student_fee", "expense"])
    .order("id");
  const peopleQuery = db
    .from("profiles")
    .select("id,name,role,office_id,matric_number")
    .order("id");
  if (officeId) {
    recordsQuery = recordsQuery.eq("office_id", officeId);
  }
  // Collector names may belong to Super Admin, whose office is intentionally unset.
  const [records, people, offices] = await Promise.all([
    collectRows<{
      id: string;
      kind: string;
      office_id: string;
      owner_id: string;
      payload: unknown;
    }>(recordsQuery),
    collectRows<{
      id: string;
      name: string;
      role: string;
      office_id: string | null;
      matric_number: string | null;
    }>(peopleQuery),
    collectRows<{ id: string; name: string }>(
      db.from("offices").select("id,name").order("id"),
    ),
  ]);
  const officeName = (id: string) =>
    offices.find((o) => o.id === id)?.name ?? "Company";
  const provenance = (r: (typeof records)[number]) => {
    const owner = people.find((p) => p.id === r.owner_id);
    const original = (
      r.payload as {
        originalRecorder?: { id: string; name: string; role: string };
      }
    ).originalRecorder;
    return {
      recordOwnerId: r.owner_id,
      recordedByName: original?.name ?? owner?.name ?? "Historical account",
      recordedByRole: original?.role ?? owner?.role ?? "unknown",
      officeId: r.office_id,
      officeName: officeName(r.office_id),
    };
  };
  const payments = records
    .filter((r) => r.kind === "payment")
    .map((r) => ({
      ...(r.payload as PaymentRecord),
      id: r.id,
      ...provenance(r),
    }));
  const expenses = records
    .filter((r) => r.kind === "expense")
    .map((r) => ({ ...(r.payload as Expense), id: r.id, ...provenance(r) }));
  const feeRecords = records
    .filter((r) => r.kind === "student_fee")
    .map((r) => ({ ...(r.payload as StudentFee), officeId: r.office_id }));
  const current = people
    .filter(
      (p) => p.role === "student" && (!officeId || p.office_id === officeId),
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      matricNumber: p.matric_number,
      officeId: p.office_id!,
      officeName: officeName(p.office_id!),
    }));
  const formerIds = new Set([
    ...feeRecords.map((f) => f.studentId),
    ...payments
      .map((p) => p.studentId)
      .filter((id): id is string => Boolean(id)),
  ]);
  for (const id of formerIds)
    if (!current.some((p) => p.id === id)) {
      const payment = payments.find((p) => p.studentId === id);
      const fee = feeRecords.find((f) => f.studentId === id);
      const idOffice = payment?.officeId ?? fee?.officeId;
      if (idOffice)
        current.push({
          id,
          name: payment?.payerName ?? "Former student",
          matricNumber: null,
          officeId: idOffice,
          officeName: officeName(idOffice),
        });
    }
  const students = current.map((s) => ({
    ...s,
    ...ledgerStudentBalance(s.id, feeRecords, payments),
  }));
  return { actorRole: actor.role, officeId, students, payments, expenses };
}
export async function recordDirectStudentReceipt(input: {
  studentId: string;
  amountNaira: number;
  reference: string;
  earnedOn: string;
  purpose: string;
}) {
  const actor = await requireRole(["super_admin"]);
  const db = createAdminClient();
  const result = await db
    .from("profiles")
    .select("id,name,office_id,role")
    .eq("id", input.studentId)
    .eq("role", "student")
    .single();
  const student = result.data;
  if (result.error || !student?.office_id)
    throw new Error("Choose a student assigned to a company.");
  const id = financialRecordId("payment", student.office_id, input.reference);
  const existing = await db
    .from("lms_records")
    .select("owner_id,payload")
    .eq("id", id)
    .maybeSingle();
  if (existing.data) {
    const p = existing.data.payload;
    if (
      existing.data.owner_id === actor.id &&
      p.studentId === student.id &&
      p.amountNaira === input.amountNaira &&
      p.earnedOn === input.earnedOn &&
      p.purpose === input.purpose
    )
      return;
    throw new Error("This receipt reference is already recorded.");
  }
  const duplicate = await db
    .from("lms_records")
    .select("id")
    .eq("office_id", student.office_id)
    .eq("kind", "payment")
    .ilike(
      "payload->>reference",
      input.reference.trim().replace(/[\\%_]/g, "\\$&"),
    )
    .limit(1);
  if (duplicate.error) throw new Error("Unable to verify receipt reference.");
  if (duplicate.data?.length)
    throw new Error("This receipt reference is already recorded.");
  const now = new Date().toISOString();
  const payload = {
    ...input,
    id,
    studentId: student.id,
    payerName: student.name,
    payerEmail: "",
    method: "manual",
    status: "paid",
    paidAt: new Date(`${input.earnedOn}T00:00:00+01:00`).toISOString(),
    recordedAt: now,
    receivedByRole: "super_admin",
    receivedById: actor.id,
    originalRecorder: { id: actor.id, name: actor.name, role: actor.role },
    studentName: student.name,
  };
  const written = await db.from("lms_records").insert({
    id,
    kind: "payment",
    office_id: student.office_id,
    owner_id: actor.id,
    updated_by: actor.id,
    payload,
  });
  if (written.error)
    throw new Error(
      "Receipt was not saved. Check whether its reference already exists.",
    );
}
export async function recordOfficeExpense(input: {
  description: string;
  amountNaira: number;
  spentOn: string;
  reference: string;
}) {
  const actor = await requireRole(["admin"]);
  if (!actor.officeId)
    throw new Error("Your Admin account needs a company assignment.");
  const id = financialRecordId("expense", actor.officeId, input.reference);
  const now = new Date().toISOString();
  const result = await createAdminClient()
    .from("lms_records")
    .insert({
      id,
      kind: "expense",
      office_id: actor.officeId,
      owner_id: actor.id,
      updated_by: actor.id,
      payload: {
        ...input,
        id,
        recordedAt: now,
        originalRecorder: { id: actor.id, name: actor.name, role: actor.role },
      },
    });
  if (result.error)
    throw new Error(
      "Expense was not saved. Check whether its reference already exists.",
    );
}

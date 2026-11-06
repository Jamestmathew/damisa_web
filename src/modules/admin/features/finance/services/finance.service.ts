import { requireRole } from "@/shared/rbac";
import {
  financialRecordId,
  getFinancialLedger,
} from "@/shared/finance/service";
import "server-only";
import { getOfficePeople } from "@/shared/data/people";
import { getSystemSettings } from "@/modules/admin/features/settings/services/settings.service";
import { getRecord, saveRecord } from "@/shared/data/records";
import type { PaymentRecord } from "../types";
export interface StoredPayment extends PaymentRecord {
  studentId: string | null;
  receivedByRole?: "admin" | "super_admin";
  receivedById?: string;
  originalRecorder?: { id: string; name: string; role: string };
  studentName?: string;
  paidAt: string | null;
  earnedOn: string;
}
export async function getPayments(): Promise<PaymentRecord[]> {
  return (await getFinancialLedger()).payments;
}
export async function recordManualPayment(input: {
  id?: string;
  studentId: string;
  payerName: string;
  payerEmail: string;
  purpose: string;
  amountNaira: number;
  reference: string;
  earnedOn: string;
}) {
  const actor = await requireRole(["admin"]);
  if (input.id)
    return {
      ok: false as const,
      error:
        "Recorded receipts are read-only. Existing payments cannot be overwritten.",
    };
  if (!(await getSystemSettings()).allowManualPaymentRecording)
    return {
      ok: false as const,
      error: "Manual income recording is disabled in settings.",
    };
  if (!Number.isFinite(input.amountNaira) || input.amountNaira <= 0)
    return { ok: false as const, error: "Enter a valid positive amount." };
  const student = input.studentId
    ? (await getOfficePeople()).find(
        (p) => p.id === input.studentId && p.role === "student",
      )
    : null;
  if (input.studentId && !student)
    return { ok: false as const, error: "Select a student from your office." };
  const existing = input.id
    ? await getRecord<StoredPayment>("payment", input.id)
    : null;
  if (input.id && !existing)
    return { ok: false as const, error: "Income record not found." };
  if (
    (await getPayments()).some(
      (p) =>
        p.id !== input.id &&
        p.reference.toLowerCase() === input.reference.trim().toLowerCase(),
    )
  )
    return {
      ok: false as const,
      error: "This record reference already exists.",
    };
  const { id: _id, ...details } = input;
  const payment = await saveRecord<StoredPayment>(
    "payment",
    {
      ...existing,
      ...details,
      id: financialRecordId("payment", actor.officeId!, input.reference),
      receivedByRole: "admin",
      receivedById: actor.id,
      originalRecorder: { id: actor.id, name: actor.name, role: actor.role },
      studentName: student?.name,
      payerName: input.payerName.trim(),
      payerEmail: input.payerEmail.trim(),
      studentId: student?.id ?? null,
      reference: input.reference.trim(),
      method: "manual",
      status: "paid",
      recordedAt: existing?.recordedAt ?? new Date().toISOString(),
      paidAt: new Date(`${input.earnedOn}T00:00:00+01:00`).toISOString(),
    },
    existing?.id,
  );
  return { ok: true as const, payment };
}
export async function verifyPayment(id: string) {
  const actor = await requireRole(["admin"]);
  const owned = (await getPayments()).find((p) => p.id === id);
  if (!owned || !("recordOwnerId" in owned) || owned.recordOwnerId !== actor.id)
    return {
      ok: false as const,
      error: "Another person’s receipt is read-only.",
    };
  const payment = await getRecord<StoredPayment>("payment", id);
  if (!payment)
    return { ok: false as const, error: "Income record not found." };
  if (payment.status !== "paid")
    await saveRecord(
      "payment",
      { ...payment, status: "paid", paidAt: new Date().toISOString() },
      id,
    );
  return { ok: true as const };
}

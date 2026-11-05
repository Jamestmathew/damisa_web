import "server-only";
import { listRecords } from "@/shared/data/records";
import { studentBalance, type StudentFee } from "@/shared/data/balance";
import type { StoredPayment } from "@/modules/admin/features/finance/services/finance.service";
import type { StudentPayment } from "../types";
export async function getStudentPayments(): Promise<StudentPayment[]> {
  return (await listRecords<StoredPayment>("payment")).map((p) => ({
    id: p.id,
    purpose: p.purpose,
    amountNaira: p.amountNaira,
    status: p.status === "paid" ? "paid" : "pending",
    paidAt: p.paidAt,
    reference: p.reference,
  }));
}
export async function getStudentBalance() {
  const [payments, fees] = await Promise.all([
    getStudentPayments(),
    listRecords<StudentFee>("student_fee"),
  ]);
  return studentBalance(fees[0], payments);
}

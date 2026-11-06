import { studentBalance, type StudentFee } from "@/shared/data/balance";
export interface Expense {
  id: string;
  description: string;
  amountNaira: number;
  spentOn: string;
  reference: string;
  recordedAt: string;
  recordedByName?: string;
  recordedByRole?: string;
}
export function moneyTotal(values: number[]) {
  return values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
}
export function ledgerStudentBalance(
  studentId: string,
  fees: StudentFee[],
  payments: {
    studentId?: string | null;
    amountNaira: number;
    status: string;
  }[],
) {
  return studentBalance(
    fees.find((f) => f.studentId === studentId),
    payments.filter((p) => p.studentId === studentId),
  );
}
export function validFinanceMonth(value: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}
export function csvCell(value: string | number | null | undefined) {
  if (typeof value === "number") return String(value);
  const text = String(value ?? "");
  return (
    '"' +
    (/^[\s]*[=+\-@]/.test(text) ? "'" + text : text).replaceAll('"', '""') +
    '"'
  );
}

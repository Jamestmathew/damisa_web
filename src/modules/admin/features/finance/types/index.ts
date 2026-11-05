import type { PaymentStatus } from "@/modules/admin/shared/types";

export type PaymentMethod = "card" | "bank_transfer" | "cash" | "manual";

export interface PaymentRecord {
  earnedOn?: string;
  studentId?: string | null;
  id: string;
  payerName: string;
  payerEmail: string;
  purpose: string;
  amountNaira: number;
  method: PaymentMethod;
  status: PaymentStatus;
  recordedAt: string;
  reference: string;
}

export type FinanceActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

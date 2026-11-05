export type StudentPaymentStatus = "paid" | "pending" | "overdue";

export interface StudentPayment {
  id: string;
  purpose: string;
  amountNaira: number;
  status: StudentPaymentStatus;
  paidAt: string | null;
  reference: string;
}

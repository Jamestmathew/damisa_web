export interface StudentFee {
  studentId: string;
  totalDueNaira: number;
  description: string;
}
export function studentBalance(
  fee: StudentFee | undefined,
  payments: { amountNaira: number; status: string }[],
) {
  const paidMinor = payments
    .filter((p) => p.status === "paid")
    .reduce((total, p) => total + Math.round(p.amountNaira * 100), 0);
  const dueMinor = fee ? Math.round(fee.totalDueNaira * 100) : null;
  return {
    totalDueNaira: dueMinor === null ? null : dueMinor / 100,
    paidNaira: paidMinor / 100,
    remainingNaira:
      dueMinor === null ? null : Math.max(0, dueMinor - paidMinor) / 100,
    creditNaira:
      dueMinor === null ? 0 : Math.max(0, paidMinor - dueMinor) / 100,
  };
}

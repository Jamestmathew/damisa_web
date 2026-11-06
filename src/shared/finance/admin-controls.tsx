"use client";
import { useRouter } from "next/navigation";
import { RecordPaymentDialog } from "@/modules/admin/features/finance/components/record-payment-dialog";
import { StudentFeeDialog } from "@/modules/admin/features/finance/components/student-fee-dialog";
import { FinanceEntryForm } from "./entry-forms";
export function AdminFinanceControls({
  students,
}: {
  students: {
    id: string;
    name: string;
    matricNumber: string | null;
    totalDueNaira: number | null;
  }[];
}) {
  const router = useRouter();
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <RecordPaymentDialog
        students={students}
        onSaved={() => router.refresh()}
      />
      <StudentFeeDialog students={students} />
      <FinanceEntryForm kind="expense" />
    </div>
  );
}

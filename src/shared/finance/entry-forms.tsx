"use client";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { recordExpenseAction, recordSuperReceiptAction } from "./actions";
export function FinanceEntryForm({
  kind,
  students = [],
}: {
  kind: "expense" | "receipt";
  students?: {
    id: string;
    name: string;
    officeName: string;
    matricNumber: string | null;
  }[];
}) {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition();
  const router = useRouter();
  const receipt = kind === "receipt";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setMessage("");
    start(async () => {
      try {
        const result = await (
          receipt ? recordSuperReceiptAction : recordExpenseAction
        )(data);
        if (result.ok) {
          setOpen(false);
          router.refresh();
        } else setMessage(result.error);
      } catch {
        setMessage("Unable to save. Sign in and retry.");
      }
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          {receipt
            ? "Record payment received by Super Admin"
            : "Record expense"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {receipt
              ? "Student payment received directly"
              : "Record company expense"}
          </DialogTitle>
          <DialogDescription>
            {receipt
              ? "Admin and the student will see this receipt. Existing Admin receipts cannot be edited here."
              : "This expense will appear in your report and Super Admin’s read-only view."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {receipt && (
            <label className="block text-sm">
              Student
              <select
                name="studentId"
                required
                className="mt-1 h-10 w-full rounded-md border bg-background px-2"
              >
                <option value="">Choose student and company</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.matricNumber ?? ""} · {s.officeName}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-sm">
            {receipt ? "Payment purpose" : "Expense description"}
            <Input
              name={receipt ? "purpose" : "description"}
              required
              minLength={2}
              maxLength={300}
            />
          </label>
          <label className="block text-sm">
            Amount (₦)
            <Input
              type="number"
              name="amountNaira"
              required
              min="0.01"
              step="0.01"
              max="1000000000000"
            />
          </label>
          <label className="block text-sm">
            Date {receipt ? "received" : "spent"}
            <Input
              type="date"
              name={receipt ? "earnedOn" : "spentOn"}
              required
            />
          </label>
          <label className="block text-sm">
            Unique receipt / reference
            <Input name="reference" required minLength={2} maxLength={100} />
          </label>
          {message && (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          )}
          <Button disabled={pending}>
            {pending ? "Saving…" : "Save record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

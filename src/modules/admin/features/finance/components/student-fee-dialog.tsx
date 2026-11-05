"use client";
import { useState, useTransition } from "react";
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
import { setStudentFeeAction } from "../actions/set-student-fee.action";
export interface FeeStudentOption {
  id: string;
  name: string;
  matricNumber?: string | null;
  totalDueNaira?: number | null;
}
export function StudentFeeDialog({
  students,
}: {
  students: FeeStudentOption[];
}) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(students[0]?.id ?? "");
  const student = students.find((s) => s.id === selected);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Set student fees</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set total student fees</DialogTitle>
          <DialogDescription>
            Set the total amount this student is expected to pay. Recorded
            payments are deducted automatically; changing this amount does not
            create income.
          </DialogDescription>
        </DialogHeader>
        <form
          key={selected}
          className="space-y-3"
          action={(data) =>
            startTransition(async () => {
              setError("");
              try {
                const result = await setStudentFeeAction(data);
                if (result.ok) setOpen(false);
                else setError(result.error);
              } catch {
                setError("Unable to save fees. Refresh and retry.");
              }
            })
          }
        >
          <label className="block text-sm">
            Student
            <select
              name="studentId"
              className="mt-1 h-10 w-full rounded-md border bg-background px-3"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.matricNumber})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Total fees (₦)
            <Input
              name="totalDueNaira"
              type="number"
              min="0"
              step="0.01"
              defaultValue={student?.totalDueNaira ?? 0}
              required
            />
          </label>
          <label className="block text-sm">
            Description
            <Input
              name="description"
              defaultValue="Total tuition and fees"
              required
              maxLength={200}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button disabled={pending || !students.length} type="submit">
            {pending ? "Saving..." : "Save fees"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

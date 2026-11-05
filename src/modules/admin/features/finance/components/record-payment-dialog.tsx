"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

import { recordPaymentAction } from "../actions/record-payment.action";
import {
  recordPaymentSchema,
  type RecordPaymentSchema,
} from "../validation/record-payment.schema";
import type { PaymentRecord, FinanceActionResult } from "../types";

export function RecordPaymentDialog({
  onSaved,
  record,
  students,
}: {
  onSaved: () => void;
  record?: PaymentRecord;
  students: { id: string; name: string; matricNumber?: string | null }[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<FinanceActionResult | null>(null);

  const form = useForm<RecordPaymentSchema>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: record
      ? {
          id: record.id,
          studentId: record.studentId ?? "",
          payerName: record.payerName,
          payerEmail: record.payerEmail,
          purpose: record.purpose,
          amountNaira: record.amountNaira,
          reference: record.reference,
          earnedOn: record.earnedOn ?? record.recordedAt.slice(0, 10),
        }
      : {
          studentId: "",
          payerName: "",
          payerEmail: "",
          purpose: "",
          amountNaira: 0,
          reference: "",
          earnedOn: new Intl.DateTimeFormat("en-CA", {
            timeZone: "Africa/Lagos",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date()),
        },
  });

  function onSubmit(values: RecordPaymentSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", values.id);
      formData.set("studentId", values.studentId);
      formData.set("earnedOn", values.earnedOn);
      formData.set("payerName", values.payerName);
      formData.set("payerEmail", values.payerEmail);
      formData.set("purpose", values.purpose);
      formData.set("amountNaira", String(values.amountNaira));
      formData.set("reference", values.reference);

      const result = await recordPaymentAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message)
            form.setError(field as keyof RecordPaymentSchema, { message });
        }
        return;
      }

      if (result.ok) {
        setOpen(false);
        form.reset();
        onSaved();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setState(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={record ? "ghost" : "default"}
          size={record ? "icon" : "default"}
          aria-label={record ? "Edit company income" : undefined}
        >
          {record ? (
            <Pencil className="size-4" />
          ) : (
            <>
              <Plus className="size-4" />
              Record income
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record company income</DialogTitle>
          <DialogDescription>
            Enter the amount earned by a company. This is a manual income
            record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {state && !state.ok ? (
            <FormStatusMessage variant="error" message={state.error} />
          ) : null}

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student payment (optional)</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-10 w-full rounded-md border bg-background px-3"
                    >
                      <option value="">Other company income</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.matricNumber})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Selecting a student adds this payment to their balance and
                    the company income once.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact email (optional)</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. October earnings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="earnedOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amountNaira"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₦)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TXN-88217" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={isPending}
              loadingText="Recording..."
            >
              Save income
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

import { saveDepartmentAction } from "../actions/save-department.action";
import {
  departmentFormSchema,
  type DepartmentFormSchema,
} from "../validation/department-form.schema";
import type { Department, DepartmentActionResult } from "../types";

interface DepartmentFormDialogProps {
  trigger: ReactNode;
  department?: Department;
  onSaved: () => void;
}

export function DepartmentFormDialog({ trigger, department, onSaved }: DepartmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<DepartmentActionResult | null>(null);

  const form = useForm<DepartmentFormSchema>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: department
      ? { id: department.id, name: department.name, code: department.code, headOfDepartment: department.headOfDepartment }
      : { name: "", code: "", headOfDepartment: "" },
  });

  function onSubmit(values: DepartmentFormSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", values.id);
      formData.set("name", values.name);
      formData.set("code", values.code);
      formData.set("headOfDepartment", values.headOfDepartment);

      const result = await saveDepartmentAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) form.setError(field as keyof DepartmentFormSchema, { message });
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
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setState(null); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{department ? "Edit department" : "Add department"}</DialogTitle>
          <DialogDescription>
            {department ? "Update this department's details." : "Create a new academic department."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {state && !state.ok ? <FormStatusMessage variant="error" message={state.error} /> : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CSC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headOfDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head of department</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton type="submit" className="w-full" isLoading={isPending} loadingText="Saving...">
              {department ? "Save changes" : "Create department"}
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

import { saveClassAction } from "../actions/save-class.action";
import {
  classFormSchema,
  type ClassFormSchema,
} from "../validation/class-form.schema";
import type { AdminClass, ClassActionResult } from "../types";

interface ClassFormDialogProps {
  trigger: ReactNode;
  classItem?: AdminClass;
  departmentNames: string[];
  onSaved: () => void;
}

export function ClassFormDialog({
  trigger,
  classItem,
  departmentNames,
  onSaved,
}: ClassFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ClassActionResult | null>(null);

  const form = useForm<ClassFormSchema>({
    resolver: zodResolver(classFormSchema),
    defaultValues: classItem
      ? {
          id: classItem.id,
          name: classItem.name,
          department: classItem.department,
          teacher: classItem.teacher,
          schedule: classItem.schedule,
        }
      : {
          name: "",
          department: departmentNames[0] ?? "",
          teacher: "",
          schedule: "",
        },
  });

  function onSubmit(values: ClassFormSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", values.id);
      formData.set("name", values.name);
      formData.set("department", values.department);
      formData.set("teacher", values.teacher);
      formData.set("schedule", values.schedule);

      const result = await saveClassAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message)
            form.setError(field as keyof ClassFormSchema, { message });
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{classItem ? "Edit class" : "Add class"}</DialogTitle>
          <DialogDescription>
            {classItem
              ? "Update this class's details."
              : "Create a new class section."}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CSC 301 - Section A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departmentNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mon & Wed, 09:00-10:00 | Main Hall"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={isPending}
              loadingText="Saving..."
            >
              {classItem ? "Save changes" : "Create class"}
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Textarea } from "@/components/ui/textarea";
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

import { saveAssignmentAction } from "../actions/save-assignment.action";
import {
  assignmentFormSchema,
  type AssignmentFormSchema,
} from "../validation/assignment.schema";
import type { AssignmentActionResult, TutorAssignment } from "../types";

interface AssignmentFormDialogProps {
  trigger: ReactNode;
  courseOptions: { id: string; label: string }[];
  assignment?: TutorAssignment;
  onSaved: () => void;
}

export function AssignmentFormDialog({
  trigger,
  courseOptions,
  assignment,
  onSaved,
}: AssignmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AssignmentActionResult | null>(null);

  const form = useForm<AssignmentFormSchema>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: assignment
      ? {
          id: assignment.id,
          courseId: assignment.courseId,
          title: assignment.title,
          instructions: assignment.instructions ?? assignment.title,
          dueAt: new Date(Date.parse(assignment.dueAt) + 3600000)
            .toISOString()
            .slice(0, 16),
          maxScore: assignment.maxScore,
        }
      : {
          courseId: courseOptions[0]?.id ?? "",
          title: "",
          instructions: "",
          dueAt: "",
          maxScore: 20,
        },
  });

  function onSubmit(values: AssignmentFormSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", values.id);
      formData.set("courseId", values.courseId);
      formData.set("title", values.title);
      formData.set("instructions", values.instructions);
      formData.set("dueAt", values.dueAt);
      formData.set("maxScore", String(values.maxScore));

      const result = await saveAssignmentAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message)
            form.setError(field as keyof AssignmentFormSchema, { message });
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
          <DialogTitle>
            {assignment ? "Edit assignment" : "New assignment"}
          </DialogTitle>
          <DialogDescription>
            {assignment
              ? "Update this assignment."
              : "Create a new assignment for your course."}
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
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={Boolean(assignment)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courseOptions.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.label}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due (Lagos time)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max score</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
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
              loadingText="Saving..."
            >
              {assignment ? "Save changes" : "Create assignment"}
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

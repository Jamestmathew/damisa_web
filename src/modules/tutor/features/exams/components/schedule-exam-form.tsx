"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { scheduleExamAction } from "../actions/manage-exam.action";
import { examFormSchema, type ExamFormSchema } from "../validation/exam-form.schema";
import type { ExamActionResult } from "../types";

export function ScheduleExamForm({ courseOptions }: { courseOptions: { id: string; label: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ExamActionResult | null>(null);

  const form = useForm<ExamFormSchema>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      courseId: courseOptions[0]?.id ?? "",
      title: "",
      date: "",
      time: "",
      venue: "",
      durationMinutes: 90,
    },
  });

  function onSubmit(values: ExamFormSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("courseId", values.courseId);
      formData.set("title", values.title);
      formData.set("date", values.date);
      formData.set("time", values.time);
      formData.set("venue", values.venue);
      formData.set("durationMinutes", String(values.durationMinutes));

      const result = await scheduleExamAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) form.setError(field as keyof ExamFormSchema, { message });
        }
        return;
      }

      if (result.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      {state && !state.ok ? <FormStatusMessage variant="error" message={state.error} /> : null}
      {state?.ok ? <FormStatusMessage variant="success" message={state.message} /> : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
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
              <FormLabel>Exam title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Final Examination" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Aug 20, 2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 9:00 AM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (min)</FormLabel>
                <FormControl>
                  <Input type="number" min={15} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <LoadingButton type="submit" className="w-full" isLoading={isPending} loadingText="Scheduling...">
          Schedule exam
        </LoadingButton>
      </form>
    </Form>
  );
}

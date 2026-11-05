"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

import { createCourseAction } from "../actions/create-course.action";
import { createCourseSchema, type CreateCourseSchema } from "../validation/course-builder.schema";
import type { CourseBuilderActionResult } from "../actions/create-course.action";

export function CreateCourseForm() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<CourseBuilderActionResult | null>(null);

  const form = useForm<CreateCourseSchema>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { title: "", code: "", description: "", creditUnits: 3 },
  });

  function onSubmit(values: CreateCourseSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", values.title);
      formData.set("code", values.code);
      formData.set("description", values.description);
      formData.set("creditUnits", String(values.creditUnits));

      const result = await createCourseAction(null, formData);
      setState(result);

      if (result && !result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) form.setError(field as keyof CreateCourseSchema, { message });
        }
      }
    });
  }

  return (
    <Form {...form}>
      {state && !state.ok ? <FormStatusMessage variant="error" message={state.error} /> : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Advanced Networking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. CSC 401" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="creditUnits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credit units</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton type="submit" isLoading={isPending} loadingText="Creating course...">
          Create course
        </LoadingButton>
      </form>
    </Form>
  );
}

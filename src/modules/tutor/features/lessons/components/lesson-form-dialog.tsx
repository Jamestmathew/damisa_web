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
import { Textarea } from "@/components/ui/textarea";
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

import { saveLessonAction } from "../actions/save-lesson.action";
import { lessonFormSchema, type LessonFormSchema } from "../validation/lesson-form.schema";
import type { LessonActionResult, TutorLesson } from "../types";

interface LessonFormDialogProps {
  trigger: ReactNode;
  courseId: string;
  lesson?: TutorLesson;
  onSaved: () => void;
}

export function LessonFormDialog({ trigger, courseId, lesson, onSaved }: LessonFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<LessonActionResult | null>(null);

  const form = useForm<LessonFormSchema>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: lesson
      ? {
          id: lesson.id,
          courseId,
          title: lesson.title,
          contentType: lesson.contentType,
          durationMinutes: lesson.durationMinutes,
          body: lesson.body,
        }
      : { courseId, title: "", contentType: "video", durationMinutes: 10, body: "" },
  });

  function onSubmit(values: LessonFormSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", values.id);
      formData.set("courseId", values.courseId);
      formData.set("title", values.title);
      formData.set("contentType", values.contentType);
      formData.set("durationMinutes", String(values.durationMinutes));
      formData.set("body", values.body);

      const result = await saveLessonAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) form.setError(field as keyof LessonFormSchema, { message });
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
          <DialogTitle>{lesson ? "Edit lesson" : "New lesson"}</DialogTitle>
          <DialogDescription>
            {lesson ? "Update this lesson's content." : "Add a lesson to this course."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {state && !state.ok ? <FormStatusMessage variant="error" message={state.error} /> : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="resource">Resource</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton type="submit" className="w-full" isLoading={isPending} loadingText="Saving...">
              {lesson ? "Save changes" : "Create lesson"}
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

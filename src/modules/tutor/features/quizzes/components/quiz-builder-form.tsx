"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

import { createQuizAction } from "../actions/create-quiz.action";
import { quizFormSchema, type QuizFormSchema } from "../validation/quiz-form.schema";
import type { QuizActionResult } from "../types";

interface QuizBuilderFormProps {
  courseOptions: { id: string; label: string }[];
}

export function QuizBuilderForm({ courseOptions }: QuizBuilderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<QuizActionResult | null>(null);

  const form = useForm<QuizFormSchema>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      courseId: courseOptions[0]?.id ?? "",
      title: "",
      durationMinutes: 15,
      questions: [{ prompt: "", options: ["", ""], correctOptionIndex: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "questions" });

  function onSubmit(values: QuizFormSchema) {
    setState(null);
    startTransition(async () => {
      const result = await createQuizAction(values);
      setState(result);

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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quiz title</FormLabel>
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
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <FormField
                    control={form.control}
                    name={`questions.${index}.prompt`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Question {index + 1}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      onClick={() => remove(index)}
                      aria-label={`Remove question ${index + 1}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  ) : null}
                </div>

                {[0, 1, 2, 3].map((optionIndex) => (
                  <FormField
                    key={optionIndex}
                    control={form.control}
                    name={`questions.${index}.options.${optionIndex}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-normal text-muted-foreground">
                          Option {optionIndex + 1}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="Leave blank to omit" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name={`questions.${index}.correctOptionIndex`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct option</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Option 1</SelectItem>
                          <SelectItem value="1">Option 2</SelectItem>
                          <SelectItem value="2">Option 3</SelectItem>
                          <SelectItem value="3">Option 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ prompt: "", options: ["", ""], correctOptionIndex: 0 })}
        >
          <Plus className="size-4" />
          Add question
        </Button>

        <LoadingButton type="submit" className="w-full" isLoading={isPending} loadingText="Creating quiz...">
          Create quiz
        </LoadingButton>
      </form>
    </Form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

import { submitAssignmentAction } from "../actions/submit-assignment.action";
import {
  assignmentSubmissionSchema,
  type AssignmentSubmissionSchema,
} from "../validation/submission.schema";
import type { AssignmentActionResult } from "../types";

interface AssignmentSubmissionFormProps {
  assignmentId: string;
  existingSubmission: string | null;
  existingAttachmentCount?: number;
  disabled?: boolean;
}

export function AssignmentSubmissionForm({
  assignmentId,
  existingSubmission,
  existingAttachmentCount = 0,
  disabled = false,
}: AssignmentSubmissionFormProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AssignmentActionResult | null>(null);

  const form = useForm<AssignmentSubmissionSchema>({
    resolver: zodResolver(assignmentSubmissionSchema),
    defaultValues: {
      assignmentId,
      submissionText: existingSubmission ?? "",
      attachmentCount: existingAttachmentCount,
    },
  });

  function onSubmit(values: AssignmentSubmissionSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("assignmentId", values.assignmentId);
      formData.set("submissionText", values.submissionText);
      for (const file of attachments) formData.append("attachments", file);

      const result = await submitAssignmentAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors?.submissionText) {
        form.setError("submissionText", {
          message: result.fieldErrors.submissionText,
        });
      }
    });
  }

  return (
    <Form {...form}>
      {state ? (
        <FormStatusMessage
          variant={state.ok ? "success" : "error"}
          message={state.ok ? state.message : state.error}
        />
      ) : null}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="submissionText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your submission</FormLabel>
              <FormControl>
                <Textarea
                  rows={8}
                  placeholder="Write or paste your submission here..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <label className="block text-sm font-medium">
          Attachments
          <input
            className="mt-2 block w-full text-sm"
            type="file"
            multiple
            disabled={disabled}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.docx,.xlsx,.pptx,.zip"
            onChange={(event) => {
              setAttachments(Array.from(event.target.files ?? []));
              form.setValue(
                "attachmentCount",
                event.target.files?.length || existingAttachmentCount,
                { shouldValidate: true },
              );
            }}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Up to five files, 3 MB total. Uploading new files replaces your
          previous attachments. Text is optional when files are attached.
        </p>
        <LoadingButton
          disabled={disabled}
          type="submit"
          isLoading={isPending}
          loadingText="Submitting..."
        >
          {existingSubmission ? "Update submission" : "Submit assignment"}
        </LoadingButton>
      </form>
    </Form>
  );
}

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
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

import { savePreferencesAction } from "../actions/save-preferences.action";
import {
  preferencesFormSchema,
  type PreferencesFormSchema,
} from "../validation/preferences-form.schema";
import type { SettingsActionResult, TutorPreferences } from "../types";

export function NotificationPreferencesForm({ preferences }: { preferences: TutorPreferences }) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SettingsActionResult | null>(null);

  const form = useForm<PreferencesFormSchema>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: preferences,
  });

  function onSubmit(values: PreferencesFormSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      if (values.emailOnSubmission) formData.set("emailOnSubmission", "on");
      if (values.emailOnAnnouncementReply) formData.set("emailOnAnnouncementReply", "on");
      if (values.weeklyDigest) formData.set("weeklyDigest", "on");

      const result = await savePreferencesAction(null, formData);
      setState(result);
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="emailOnSubmission"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0 space-x-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary"
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">
                Email me when a student submits an assignment
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailOnAnnouncementReply"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0 space-x-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary"
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">
                Notify me about announcement replies
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weeklyDigest"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0 space-x-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary"
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">Send me a weekly summary digest</FormLabel>
            </FormItem>
          )}
        />

        <LoadingButton type="submit" isLoading={isPending} loadingText="Saving...">
          Save preferences
        </LoadingButton>
      </form>
    </Form>
  );
}

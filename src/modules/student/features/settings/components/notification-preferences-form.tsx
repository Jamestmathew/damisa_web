"use client";

import { useState, useTransition } from "react";
import type { z } from "zod";
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

import { updateNotificationsAction } from "../actions/update-notifications.action";
import {
  notificationPreferencesSchema,
  type NotificationPreferencesSchema,
} from "../validation/preferences.schema";
import type { NotificationPreferences, SettingsActionResult } from "../types";

const TOGGLES: {
  name: keyof NotificationPreferencesSchema;
  label: string;
  hint: string;
}[] = [
  {
    name: "emailNotifications",
    label: "Email notifications",
    hint: "Get important updates in your inbox",
  },
  {
    name: "assignmentReminders",
    label: "Assignment reminders",
    hint: "Reminders before assignments are due",
  },
  {
    name: "announcementAlerts",
    label: "Announcement alerts",
    hint: "New announcements from your courses",
  },
];

export function NotificationPreferencesForm({
  initialValues,
}: {
  initialValues: NotificationPreferences;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SettingsActionResult | null>(null);

  const form = useForm<
    z.input<typeof notificationPreferencesSchema>,
    unknown,
    NotificationPreferencesSchema
  >({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: initialValues,
  });

  function onSubmit(values: NotificationPreferencesSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      if (values.emailNotifications) formData.set("emailNotifications", "on");
      if (values.assignmentReminders) formData.set("assignmentReminders", "on");
      if (values.announcementAlerts) formData.set("announcementAlerts", "on");

      const result = await updateNotificationsAction(null, formData);
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

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {TOGGLES.map((toggle) => (
          <FormField
            key={toggle.name}
            control={form.control}
            name={toggle.name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border border-border p-3">
                <div>
                  <FormLabel className="cursor-pointer">
                    {toggle.label}
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">{toggle.hint}</p>
                </div>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}

        <LoadingButton
          type="submit"
          isLoading={isPending}
          loadingText="Saving..."
        >
          Save preferences
        </LoadingButton>
      </form>
    </Form>
  );
}

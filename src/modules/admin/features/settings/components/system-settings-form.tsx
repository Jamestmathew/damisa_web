"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

import { saveSystemSettingsAction } from "../actions/save-system-settings.action";
import {
  systemSettingsSchema,
  type SystemSettingsSchema,
} from "../validation/system-settings.schema";
import type { SettingsActionResult, SystemSettings } from "../types";

export function SystemSettingsForm({ settings }: { settings: SystemSettings }) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SettingsActionResult | null>(null);

  const form = useForm<SystemSettingsSchema>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: settings,
  });

  function onSubmit(values: SystemSettingsSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("institutionName", values.institutionName);
      formData.set("academicSession", values.academicSession);
      formData.set("supportEmail", values.supportEmail);
      if (values.allowManualPaymentRecording)
        formData.set("allowManualPaymentRecording", "on");

      const result = await saveSystemSettingsAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message)
            form.setError(field as keyof SystemSettingsSchema, { message });
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Institution details</CardTitle>
        <CardDescription>
          General settings that apply across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              name="institutionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution name</FormLabel>
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
                name="academicSession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic session</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2026/2027" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allowManualPaymentRecording"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    Allow manual company income recording in Finance
                  </FormLabel>
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              isLoading={isPending}
              loadingText="Saving..."
            >
              Save settings
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

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
import { cn } from "@/lib/utils";

import { updateAppearanceAction } from "../actions/update-appearance.action";
import {
  appearancePreferencesSchema,
  type AppearancePreferencesSchema,
} from "../validation/preferences.schema";
import type { AppearancePreferences, SettingsActionResult } from "../types";

const THEME_OPTIONS: {
  value: AppearancePreferencesSchema["theme"];
  label: string;
}[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function AppearanceSettingsForm({
  initialValues,
}: {
  initialValues: AppearancePreferences;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SettingsActionResult | null>(null);

  const form = useForm<
    z.input<typeof appearancePreferencesSchema>,
    unknown,
    AppearancePreferencesSchema
  >({
    resolver: zodResolver(appearancePreferencesSchema),
    defaultValues: initialValues,
  });

  function onSubmit(values: AppearancePreferencesSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("theme", values.theme);
      if (values.compactSidebar) formData.set("compactSidebar", "on");

      const result = await updateAppearanceAction(null, formData);
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
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        "flex-1 rounded-md border border-input px-3 py-2 text-sm font-medium transition-colors",
                        field.value === option.value
                          ? "border-primary bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compactSidebar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border border-border p-3">
              <FormLabel className="cursor-pointer">
                Compact sidebar by default
              </FormLabel>
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

        <LoadingButton
          type="submit"
          isLoading={isPending}
          loadingText="Saving..."
        >
          Save appearance
        </LoadingButton>
      </form>
    </Form>
  );
}

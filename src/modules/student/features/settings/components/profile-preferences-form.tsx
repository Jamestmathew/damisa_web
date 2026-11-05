"use client";

import { useState, useTransition } from "react";
import type { z } from "zod";
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

import { updateProfileAction } from "../actions/update-profile.action";
import {
  profilePreferencesSchema,
  type ProfilePreferencesSchema,
} from "../validation/preferences.schema";
import type { ProfilePreferences, SettingsActionResult } from "../types";

export function ProfilePreferencesForm({
  initialValues,
}: {
  initialValues: ProfilePreferences;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SettingsActionResult | null>(null);

  const form = useForm<
    z.input<typeof profilePreferencesSchema>,
    unknown,
    ProfilePreferencesSchema
  >({
    resolver: zodResolver(profilePreferencesSchema),
    defaultValues: initialValues,
  });

  function onSubmit(values: ProfilePreferencesSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("displayName", values.displayName);
      formData.set("bio", values.bio ?? "");

      const result = await updateProfileAction(null, formData);
      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message)
            form.setError(field as keyof ProfilePreferencesSchema, { message });
        }
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
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="A short bio (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          isLoading={isPending}
          loadingText="Saving..."
        >
          Save profile
        </LoadingButton>
      </form>
    </Form>
  );
}

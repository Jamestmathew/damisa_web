"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { forgotPasswordAction } from "@/modules/auth/actions/forgot-password.action";
import type { AuthActionState } from "@/modules/auth/types";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/modules/auth/validation/forgot-password.schema";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AuthActionState>(null);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotPasswordSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", values.email);

      const result = await forgotPasswordAction(null, formData);
      setState(result);

      if (!result?.ok && result?.fieldErrors?.email) {
        form.setError("email", { message: result.fieldErrors.email });
      }
    });
  }

  if (state?.ok) {
    return (
      <FormStatusMessage
        variant="success"
        message={state.message ?? "Check your inbox for a reset link."}
      />
    );
  }

  return (
    <Form {...form}>
      {state && !state.ok ? (
        <FormStatusMessage variant="error" message={state.error} />
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={isPending}
          loadingText="Sending link..."
        >
          Send reset link
        </LoadingButton>
      </form>
    </Form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { AUTH_ROUTES } from "@/modules/auth/constants";
import { resetPasswordAction } from "@/modules/auth/actions/reset-password.action";
import type { AuthActionState } from "@/modules/auth/types";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/modules/auth/validation/reset-password.schema";
import { PasswordInput, LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AuthActionState>(null);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  function onSubmit(values: ResetPasswordSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("token", values.token);
      formData.set("password", values.password);
      formData.set("confirmPassword", values.confirmPassword);

      const result = await resetPasswordAction(null, formData);
      setState(result);

      if (!result?.ok && result?.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            form.setError(field as keyof ResetPasswordSchema, { message });
          }
        }
      }

      if (result?.ok) {
        setTimeout(() => router.push(AUTH_ROUTES.login), 1500);
      }
    });
  }

  if (!token) {
    return <FormStatusMessage variant="error" message="This reset link is missing a token." />;
  }

  if (state?.ok) {
    return (
      <FormStatusMessage
        variant="success"
        message={state.message ?? "Password reset. Redirecting to sign in..."}
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={isPending}
          loadingText="Resetting..."
        >
          Reset password
        </LoadingButton>
      </form>
    </Form>
  );
}

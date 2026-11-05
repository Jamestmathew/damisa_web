"use client";

import { useState, useTransition } from "react";
import type { z } from "zod";
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
import { AUTH_ROUTES } from "@/modules/auth/constants";
import { loginAction } from "@/modules/auth/actions/login.action";
import type { AuthActionState } from "@/modules/auth/types";
import {
  loginSchema,
  type LoginSchema,
} from "@/modules/auth/validation/login.schema";
import {
  PasswordInput,
  LoadingButton,
  FormStatusMessage,
} from "@/modules/auth/components/ui";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] =
    useState<AuthActionState<{ redirectTo: string }>>(null);

  const form = useForm<z.input<typeof loginSchema>, unknown, LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", rememberMe: false },
  });

  function onSubmit(values: LoginSchema) {
    setState(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("identifier", values.identifier);
      formData.set("password", values.password);
      if (values.rememberMe) formData.set("rememberMe", "on");

      const result = await loginAction(null, formData);
      setState(result);
      if (!result?.ok) sessionStorage.removeItem("damisa.login.pending");

      if (!result?.ok && result?.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            form.setError(field as keyof LoginSchema, { message });
          }
        }
      }
    });
  }

  return (
    <Form {...form}>
      {state && !state.ok ? (
        <FormStatusMessage variant="error" message={state.error} />
      ) : null}

      <form
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            sessionStorage.setItem("damisa.login.pending", String(Date.now()));
            onSubmit(values);
          })(event);
        }}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Matric Number</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  placeholder="you@example.com or CSC/2023/001"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <a
                  href={AUTH_ROUTES.forgotPassword}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
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
                Remember me
              </FormLabel>
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={isPending}
          loadingText="Signing in..."
        >
          Sign in
        </LoadingButton>
      </form>
    </Form>
  );
}

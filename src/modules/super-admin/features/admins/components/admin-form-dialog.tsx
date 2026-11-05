"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Check } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

import { saveAdminAction } from "../actions/save-admin.action";
import {
  adminFormSchema,
  type AdminFormSchema,
} from "../validation/admin-form.schema";
import type { AdminActionResult, AdminRow } from "../types";

interface AdminFormDialogProps {
  trigger: ReactNode;
  admin?: AdminRow;
  onSaved: () => void;
}

function TemporaryCredentialNotice({ password }: { password: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-2 rounded-md border border-success/30 bg-success/5 p-3">
      <p className="text-sm font-medium text-foreground">
        Temporary password generated
      </p>

      <div className="flex items-center gap-2">
        <code className="flex-1 rounded bg-card px-2 py-1 text-sm">
          {password}
        </code>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          aria-label="Copy temporary password"
        >
          {copied ? (
            <Check className="size-4 text-success" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Share this with the admin securely — it won&apos;t be shown again.
      </p>
    </div>
  );
}

export function AdminFormDialog({
  trigger,
  admin,
  onSaved,
}: AdminFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AdminActionResult | null>(null);

  const form = useForm<AdminFormSchema>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: admin
      ? {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          staffId: admin.staffId ?? "",
          officeName: admin.officeName ?? "",
        }
      : {
          name: "",
          email: "",
          staffId: "",
          officeName: "",
        },
  });

  function onSubmit(values: AdminFormSchema) {
    setState(null);

    startTransition(async () => {
      const formData = new FormData();

      if (values.id) {
        formData.set("id", values.id);
      }

      formData.set("name", values.name);
      formData.set("email", values.email);
      formData.set("staffId", values.staffId);

      if (values.officeName) {
        formData.set("officeName", values.officeName);
      }

      const result = await saveAdminAction(null, formData);

      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            form.setError(field as keyof AdminFormSchema, {
              message,
            });
          }
        }

        return;
      }

      if (result.ok) {
        onSaved();

        if (!result.temporaryPassword) {
          setOpen(false);
          form.reset();
        }
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          setState(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{admin ? "Edit admin" : "Add admin"}</DialogTitle>

          <DialogDescription>
            {admin
              ? "Update this admin's details and office assignment."
              : "Create a new Admin account and assign an office."}
          </DialogDescription>
        </DialogHeader>

        {state?.ok && state.temporaryPassword ? (
          <TemporaryCredentialNotice password={state.temporaryPassword} />
        ) : null}

        <Form {...form}>
          {state && !state.ok ? (
            <FormStatusMessage variant="error" message={state.error} />
          ) : null}

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff ID</FormLabel>

                  <FormControl>
                    <Input placeholder="e.g. ADM-0002" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="officeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office</FormLabel>

                  <FormControl>
                    <Input placeholder="e.g. Academic Affairs" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={isPending}
              loadingText="Saving..."
            >
              {admin ? "Save changes" : "Create admin"}
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

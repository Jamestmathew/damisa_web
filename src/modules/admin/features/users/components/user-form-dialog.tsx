"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton, FormStatusMessage } from "@/modules/auth/components/ui";

import { saveUserAction } from "../actions/save-user.action";
import {
  userFormSchema,
  type UserFormSchema,
} from "../validation/user-form.schema";
import type { AdminUserRow, UserActionResult } from "../types";

interface UserFormDialogProps {
  trigger: ReactNode;
  user?: AdminUserRow;
  initialRole?: "student" | "tutor";
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
        Share this with the user securely — it won&apos;t be shown again.
      </p>
    </div>
  );
}

export function UserFormDialog({
  trigger,
  user,
  initialRole,
  onSaved,
}: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<UserActionResult | null>(null);

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userFormSchema),

    defaultValues: user
      ? {
          id: user.id,
          name: user.name,
          email: /@students\.(local|invalid)$/.test(user.email)
            ? ""
            : user.email,
          role: user.role,
          staffType: user.staffType ?? "staff",
          matricNumber: user.matricNumber ?? "",
          staffId: user.staffId ?? "",
        }
      : {
          name: "",
          email: "",
          role: initialRole ?? "student",
          staffType: "staff",
          matricNumber: "",
          staffId: "",
        },
  });

  const role = useWatch({ control: form.control, name: "role" });

  function onSubmit(values: UserFormSchema) {
    setState(null);

    startTransition(async () => {
      const formData = new FormData();

      if (values.id) {
        formData.set("id", values.id);
      }

      formData.set("name", values.name);
      formData.set("role", values.role);
      formData.set("staffType", values.staffType ?? "staff");

      if (values.email) {
        formData.set("email", values.email);
      }

      if (values.matricNumber) {
        formData.set("matricNumber", values.matricNumber);
      }

      if (values.staffId) {
        formData.set("staffId", values.staffId);
      }

      const result = await saveUserAction(null, formData);

      setState(result);

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            form.setError(field as keyof UserFormSchema, { message });
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
          <DialogTitle>
            {user
              ? "Edit user"
              : initialRole === "student"
                ? "Add student"
                : initialRole === "tutor"
                  ? "Add tutor"
                  : "Add user"}
          </DialogTitle>

          <DialogDescription>
            {user
              ? "Update this user's details and access."
              : "Create a new institution-managed account. A temporary password will be generated."}
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
            {/* Full name */}
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

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>

                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={Boolean(user) || Boolean(initialRole)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>

                      <SelectItem value="tutor">Tutor</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {role === "tutor" && (
              <FormField
                control={form.control}
                name="staffType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border bg-background px-3"
                      >
                        <option value="staff">Staff / instructor</option>
                        <option value="intern">Intern staff</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email {role === "student" ? "(optional)" : ""}
                  </FormLabel>

                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student-specific field */}
            {role === "student" ? (
              <FormField
                control={form.control}
                name="matricNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matric number</FormLabel>

                    <FormControl>
                      <Input placeholder="e.g. CSC/2023/001" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              /* Tutor-specific field */
              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff ID</FormLabel>

                    <FormControl>
                      <Input placeholder="e.g. STF-0001" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit */}
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={isPending}
              disabled={Boolean(state?.ok && state.temporaryPassword)}
              loadingText="Saving..."
            >
              {user
                ? "Save changes"
                : initialRole === "student"
                  ? "Create student"
                  : initialRole === "tutor"
                    ? "Create tutor"
                    : "Create user"}
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

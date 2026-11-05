"use client";
import { PauseCircle } from "lucide-react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users as UsersIcon,
  Plus,
  Pencil,
  Ban,
  CheckCircle2,
  Archive,
  KeyRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, EntityToolbar, ConfirmDialog } from "@/shared/components";
import { UserStatusBadge } from "@/modules/admin/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { setUserStatusAction } from "../actions/set-user-status.action";
import { resetUserPasswordAction } from "../actions/reset-user-password.action";
import type { AdminUserRow } from "../types";

import { UserFormDialog } from "./user-form-dialog";

const ROLE_LABEL: Record<AdminUserRow["role"], string> = {
  tutor: "Tutor",
  student: "Student",
};

export function UsersManager({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [resetPasswordFor, setResetPasswordFor] = useState<{
    name: string;
    password: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.matricNumber?.toLowerCase().includes(q) ||
        user.staffId?.toLowerCase().includes(q),
    );
  }, [users, query]);

  const columns: DataTableColumn<AdminUserRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (user) => (
        <div>
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {user.matricNumber ?? user.staffId ?? user.email}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge variant="outline">{ROLE_LABEL[user.role]}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <UserStatusBadge status={user.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (user) => (
        <div className="flex justify-end gap-1">
          {user.role === "student" &&
            user.status !== "suspended" &&
            user.status !== "archived" && (
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Suspend ${user.name}`}
                  >
                    <PauseCircle className="size-4 text-destructive" />
                  </Button>
                }
                title="Suspend student account"
                description={`${user.name} will lose access until the account is activated again.`}
                confirmLabel="Suspend"
                onConfirm={async () => {
                  const result = await setUserStatusAction(
                    user.id,
                    "suspended",
                  );
                  if (!result.ok) throw new Error(result.error);
                  router.refresh();
                }}
              />
            )}

          <UserFormDialog
            user={user}
            onSaved={() => router.refresh()}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${user.name}`}
              >
                <Pencil className="size-4" />
              </Button>
            }
          />

          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Reset password for ${user.name}`}
              >
                <KeyRound className="size-4" />
              </Button>
            }
            title="Reset password"
            description={`Generate a new temporary password for ${user.name}. Their current password stops working immediately.`}
            confirmLabel="Reset"
            onConfirm={async () => {
              const result = await resetUserPasswordAction(user.id);
              if (result.ok) {
                setResetPasswordFor({
                  name: user.name,
                  password: result.temporaryPassword,
                });
              }
            }}
          />

          {user.status === "active" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Deactivate ${user.name}`}
                >
                  <Ban className="size-4 text-destructive" />
                </Button>
              }
              title="Deactivate account"
              description={`${user.name} will not be able to sign in until reactivated.`}
              confirmLabel="Deactivate"
              onConfirm={async () => {
                await setUserStatusAction(user.id, "inactive");
                router.refresh();
              }}
            />
          ) : user.status !== "archived" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Activate ${user.name}`}
                >
                  <CheckCircle2 className="size-4 text-success" />
                </Button>
              }
              title="Activate account"
              description={`${user.name} will be able to sign in again.`}
              confirmLabel="Activate"
              onConfirm={async () => {
                await setUserStatusAction(user.id, "active");
                router.refresh();
              }}
            />
          ) : null}

          {user.status !== "archived" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Archive ${user.name}`}
                >
                  <Archive className="size-4 text-muted-foreground" />
                </Button>
              }
              title="Archive account"
              description={`${user.name}'s account will be archived. This can't easily be undone.`}
              confirmLabel="Archive"
              onConfirm={async () => {
                await setUserStatusAction(user.id, "archived");
                router.refresh();
              }}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      {resetPasswordFor ? (
        <div className="mb-4 flex items-center justify-between rounded-md border border-success/30 bg-success/5 p-3 text-sm">
          <span>
            New temporary password for <strong>{resetPasswordFor.name}</strong>:{" "}
            <code className="rounded bg-card px-1.5 py-0.5">
              {resetPasswordFor.password}
            </code>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResetPasswordFor(null)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search users..."
        action={
          <UserFormDialog
            onSaved={() => router.refresh()}
            trigger={
              <Button>
                <Plus className="size-4" />
                Add user
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(user) => user.id}
        emptyIcon={UsersIcon}
        emptyTitle="No users found"
      />
    </div>
  );
}

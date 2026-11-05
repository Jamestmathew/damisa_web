"use client";
import { DeleteAccountButton } from "@/modules/super-admin/features/accounts/delete-account-button";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
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
import type { DataTableColumn } from "@/shared/types";

import {
  setAdminStatusAction,
  resetAdminPasswordAction,
} from "../actions/manage-admin.action";
import type { AdminRow } from "../types";

import { AdminFormDialog } from "./admin-form-dialog";

const STATUS_LABEL: Record<AdminRow["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  archived: "Archived",
};

const STATUS_VARIANT: Record<
  AdminRow["status"],
  "success" | "outline" | "destructive" | "secondary"
> = {
  active: "success",
  inactive: "outline",
  suspended: "destructive",
  archived: "secondary",
};

export function AdminsManager({ admins }: { admins: AdminRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [resetFor, setResetFor] = useState<{
    name: string;
    password: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return admins;

    return admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(q) ||
        admin.email.toLowerCase().includes(q) ||
        admin.officeName?.toLowerCase().includes(q),
    );
  }, [admins, query]);

  const columns: DataTableColumn<AdminRow>[] = [
    {
      key: "name",
      header: "Admin",
      render: (admin) => (
        <div>
          <p className="font-medium text-foreground">{admin.name}</p>
          <p className="text-xs text-muted-foreground">{admin.email}</p>
        </div>
      ),
    },
    {
      key: "office",
      header: "Office",
      render: (admin) =>
        admin.officeName ? (
          admin.officeName
        ) : (
          <Badge variant="outline">Unassigned</Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (admin) => (
        <Badge variant={STATUS_VARIANT[admin.status]}>
          {STATUS_LABEL[admin.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (admin) => (
        <div className="flex justify-end gap-1">
          <DeleteAccountButton id={admin.id} name={admin.name} role="admin" />
          <AdminFormDialog
            admin={admin}
            onSaved={() => router.refresh()}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${admin.name}`}
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
                aria-label={`Reset password for ${admin.name}`}
              >
                <KeyRound className="size-4" />
              </Button>
            }
            title="Reset password"
            description={`Generate a new temporary password for ${admin.name}.`}
            confirmLabel="Reset"
            onConfirm={async () => {
              const result = await resetAdminPasswordAction(admin.id);

              if (result.ok) {
                setResetFor({
                  name: admin.name,
                  password: result.temporaryPassword,
                });
              }
            }}
          />

          {admin.status === "active" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Deactivate ${admin.name}`}
                >
                  <Ban className="size-4 text-destructive" />
                </Button>
              }
              title="Deactivate admin"
              description={`${admin.name} will not be able to sign in until reactivated.`}
              confirmLabel="Deactivate"
              onConfirm={async () => {
                await setAdminStatusAction(admin.id, "inactive");
                router.refresh();
              }}
            />
          ) : admin.status !== "archived" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Activate ${admin.name}`}
                >
                  <CheckCircle2 className="size-4 text-success" />
                </Button>
              }
              title="Activate admin"
              description={`${admin.name} will be able to sign in again.`}
              confirmLabel="Activate"
              onConfirm={async () => {
                await setAdminStatusAction(admin.id, "active");
                router.refresh();
              }}
            />
          ) : null}

          {admin.status !== "archived" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Archive ${admin.name}`}
                >
                  <Archive className="size-4 text-muted-foreground" />
                </Button>
              }
              title="Archive admin"
              description={`${admin.name}'s account will be archived.`}
              confirmLabel="Archive"
              onConfirm={async () => {
                await setAdminStatusAction(admin.id, "archived");
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
      {resetFor ? (
        <div className="mb-4 flex items-center justify-between rounded-md border border-success/30 bg-success/5 p-3 text-sm">
          <span>
            New temporary password for <strong>{resetFor.name}</strong>:{" "}
            <code className="rounded bg-card px-1.5 py-0.5">
              {resetFor.password}
            </code>
          </span>

          <Button variant="ghost" size="sm" onClick={() => setResetFor(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search admins..."
        action={
          <AdminFormDialog
            onSaved={() => router.refresh()}
            trigger={
              <Button>
                <Plus className="size-4" />
                Add admin
              </Button>
            }
          />
        }
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(admin) => admin.id}
        emptyIcon={ShieldCheck}
        emptyTitle="No admins found"
      />
    </div>
  );
}

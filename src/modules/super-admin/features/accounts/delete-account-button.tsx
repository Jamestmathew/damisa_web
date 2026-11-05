"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/shared/components";
import { deleteAccountAction } from "./actions/delete-account.action";
export function DeleteAccountButton({
  id,
  name,
  role,
}: {
  id: string;
  name: string;
  role: "student" | "admin";
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <div>
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Delete ${name}`}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        }
        title={`Delete ${role} account permanently`}
        description={
          role === "admin"
            ? `Delete ${name}'s login permanently? Company records and other users will be preserved.`
            : `Delete ${name}'s login and personal learning progress permanently? Company income records will be preserved.`
        }
        confirmLabel="Delete permanently"
        onConfirm={async () => {
          setError("");
          const result = await deleteAccountAction(id, role);
          if (result.ok) router.refresh();
          else setError(result.error);
        }}
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

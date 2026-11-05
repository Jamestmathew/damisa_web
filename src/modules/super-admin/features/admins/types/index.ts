import type { AuthUser } from "@/modules/auth/types";

export type AdminRow = Pick<AuthUser, "id" | "name" | "email" | "status" | "staffId" | "createdAt"> & {
  officeId: string | null;
  officeName: string | null;
};

export type AdminActionResult =
  | { ok: true; message: string; temporaryPassword?: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

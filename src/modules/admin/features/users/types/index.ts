import type { AuthUser } from "@/modules/auth/types";

/**
 * Roles that an Admin is allowed to create and manage.
 *
 * Admin accounts are managed by Super Admin, not by Admin.
 */
export type AdminCreatableRole = "student" | "tutor";

/**
 * A row displayed in the Admin Users feature.
 *
 * This feature only contains Student and Tutor accounts.
 */
export type AdminUserRow = Omit<
  Pick<
    AuthUser,
    | "id"
    | "name"
    | "email"
    | "role"
    | "status"
    | "matricNumber"
    | "staffId"
    | "createdAt"
  >,
  "role"
> & {
  role: AdminCreatableRole;
};

export type UserActionResult =
  | {
      ok: true;
      message: string;
      temporaryPassword?: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<string, string>>;
    };

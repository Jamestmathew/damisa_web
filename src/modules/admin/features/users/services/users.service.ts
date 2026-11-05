import "server-only";
import { invalidateSessions } from "@/shared/security/revoke-sessions";

import { createAdminClient } from "@/supabase/admin";
import { requirePermission } from "@/shared/rbac";

import type { AdminCreatableRole, AdminUserRow } from "../types";

type ManagedProfile = {
  id: string;
  name: string;
  role: AdminCreatableRole;
  status: AdminUserRow["status"];
  matric_number: string | null;
  staff_id: string | null;
  created_at: string;
  office_id: string | null;
};

function generateTemporaryPassword() {
  return `Welcome-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

/**
 * Gets the office belonging to the currently authenticated Admin.
 *
 * The office is deliberately obtained from the database.
 * It must never come from the browser/form submission.
 */
async function getCurrentAdminOfficeId(): Promise<
  { ok: true; officeId: string } | { ok: false; error: string }
> {
  const user = await requirePermission("users:view_all");

  if (user.role !== "admin" || !user.officeId)
    return {
      ok: false,
      error: "Your Admin account must be assigned to an office.",
    };
  return { ok: true, officeId: user.officeId };
}

/**
 * Verifies that a target user belongs to the current Admin's office
 * and is either a Student or Tutor.
 */
async function getManagedUser(
  id: string,
): Promise<
  | { ok: true; profile: ManagedProfile; officeId: string }
  | { ok: false; error: string }
> {
  const officeResult = await getCurrentAdminOfficeId();

  if (!officeResult.ok) {
    return officeResult;
  }

  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, name, role, status, matric_number, staff_id, created_at, office_id",
    )
    .eq("id", id)
    .eq("office_id", officeResult.officeId)
    .in("role", ["student", "tutor"])
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error: `Failed to find user: ${error.message}`,
    };
  }

  if (!profile) {
    return {
      ok: false,
      error: "User not found or you do not have access to this user.",
    };
  }

  return {
    ok: true,
    profile: profile as ManagedProfile,
    officeId: officeResult.officeId,
  };
}

export async function getUsers(): Promise<AdminUserRow[]> {
  const officeResult = await getCurrentAdminOfficeId();

  if (!officeResult.ok) {
    throw new Error(officeResult.error);
  }

  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, name, role, status, matric_number, staff_id, created_at, office_id",
    )
    .eq("office_id", officeResult.officeId)
    .in("role", ["student", "tutor"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  const rows = await Promise.all(
    ((profiles ?? []) as ManagedProfile[]).map(async (profile) => {
      const { data, error: authError } = await supabase.auth.admin.getUserById(
        profile.id,
      );

      if (authError) {
        throw new Error(`Failed to load account details: ${authError.message}`);
      }

      return {
        id: profile.id,
        name: profile.name,
        email: data.user?.email ?? "",
        role: profile.role,
        status: profile.status,
        matricNumber: profile.matric_number,
        staffId: profile.staff_id,
        createdAt: profile.created_at,
      };
    }),
  );

  return rows;
}

export async function createUser(input: {
  name: string;
  email: string;
  role: AdminCreatableRole;
  matricNumber?: string | null;
  staffId?: string | null;
}): Promise<
  | { ok: true; temporaryPassword: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<string, string>>;
    }
> {
  const officeResult = await getCurrentAdminOfficeId();

  if (!officeResult.ok) {
    return officeResult;
  }

  const supabase = createAdminClient();

  const temporaryPassword = generateTemporaryPassword();

  /*
   * Students may omit an email.
   *
   * Supabase Auth still needs an identifier for the account, so we
   * generate an internal email-like identifier from the matric number.
   */
  const email =
    input.email.trim() || `student-${crypto.randomUUID()}@students.invalid`;

  if (input.role === "student" && !input.matricNumber?.trim()) {
    return {
      ok: false,
      error: "Matric number is required for students.",
    };
  }

  if (input.role === "tutor" && !input.staffId?.trim()) {
    return {
      ok: false,
      error: "Staff ID is required for tutors.",
    };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      name: input.name,
      matric_number: input.matricNumber?.trim() || null,
      staff_id: input.staffId?.trim() || null,
    },
  });

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message ?? "Failed to create user account.",
    };
  }

  const userId = data.user.id;

  /*
   * The database trigger creates the initial profile as a Student.
   * We immediately configure the profile with the correct role and
   * tenant information.
   */
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: input.name.trim(),
      role: input.role,
      status: "active",
      matric_number: input.matricNumber?.trim() || null,
      staff_id: input.staffId?.trim() || null,
      office_id: officeResult.officeId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id")
    .single();

  if (profileError) {
    /*
     * Do not leave an Auth account behind if its profile could not
     * be configured.
     */
    await supabase.auth.admin.deleteUser(userId);

    return {
      ok: false,
      error: `Account was created, but the profile could not be configured: ${profileError.message}`,
    };
  }

  return {
    ok: true,
    temporaryPassword,
  };
}

export async function updateUser(
  id: string,
  input: {
    name: string;
    email?: string;
    role: AdminCreatableRole;
    matricNumber?: string | null;
    staffId?: string | null;
  },
): Promise<
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<string, string>>;
    }
> {
  const managedUser = await getManagedUser(id);

  if (!managedUser.ok) {
    return managedUser;
  }

  const supabase = createAdminClient();

  if (input.role === "student" && !input.matricNumber?.trim()) {
    return {
      ok: false,
      error: "Matric number is required for students.",
    };
  }

  if (input.role === "tutor" && !input.staffId?.trim()) {
    return {
      ok: false,
      error: "Staff ID is required for tutors.",
    };
  }

  const authUpdate: {
    email?: string;
    user_metadata: {
      name: string;
      matric_number: string | null;
      staff_id: string | null;
    };
  } = {
    user_metadata: {
      name: input.name.trim(),
      matric_number: input.matricNumber?.trim() || null,
      staff_id: input.staffId?.trim() || null,
    },
  };

  if (input.email?.trim()) {
    authUpdate.email = input.email.trim();
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(
    id,
    authUpdate,
  );

  if (authError) {
    return {
      ok: false,
      error: authError.message,
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: input.name.trim(),
      role: input.role,
      matric_number: input.matricNumber?.trim() || null,
      staff_id: input.staffId?.trim() || null,
      /*
       * Keep the existing office.
       *
       * The Admin must never be able to move a managed user into
       * another tenant through this update operation.
       */
      office_id: managedUser.officeId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("office_id", managedUser.officeId)
    .in("role", ["student", "tutor"]);

  if (profileError) {
    return {
      ok: false,
      error: profileError.message,
    };
  }

  return { ok: true };
}

export async function setUserStatus(
  id: string,
  status: AdminUserRow["status"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!["active", "inactive", "suspended", "archived"].includes(status))
    return { ok: false, error: "Invalid account status." };
  const managedUser = await getManagedUser(id);

  if (!managedUser.ok) {
    return managedUser;
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("office_id", managedUser.officeId)
    .in("role", ["student", "tutor"]);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await invalidateSessions(id);
  return { ok: true };
}

export async function resetUserPassword(
  id: string,
): Promise<
  { ok: true; temporaryPassword: string } | { ok: false; error: string }
> {
  const managedUser = await getManagedUser(id);

  if (!managedUser.ok) {
    return managedUser;
  }

  const supabase = createAdminClient();

  const temporaryPassword = generateTemporaryPassword();

  const { error } = await supabase.auth.admin.updateUserById(id, {
    password: temporaryPassword,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await invalidateSessions(id);

  return {
    ok: true,
    temporaryPassword,
  };
}

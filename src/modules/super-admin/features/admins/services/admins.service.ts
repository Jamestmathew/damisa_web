import "server-only";
import { invalidateSessions } from "@/shared/security/revoke-sessions";
import { requireRole } from "@/shared/rbac";

import { createAdminClient } from "@/supabase/admin";
import {
  getOffices,
  getOrCreateOffice,
} from "@/modules/super-admin/features/offices/services/offices.service";

import type { AdminRow } from "../types";

type AdminProfileRow = {
  id: string;
  name: string;
  role: "student" | "tutor" | "admin" | "super_admin";
  status: AdminRow["status"];
  staff_id: string | null;
  created_at: string;
};

function generateTemporaryPassword() {
  return `Welcome-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export async function getAdmins(): Promise<AdminRow[]> {
  await requireRole(["super_admin"]);
  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, role, status, staff_id, created_at, office_id")
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load admins: ${error.message}`);
  }

  const offices = await getOffices();

  return Promise.all(
    (
      (profiles ?? []) as (AdminProfileRow & { office_id: string | null })[]
    ).map(async (profile) => {
      const account = await supabase.auth.admin.getUserById(profile.id);
      if (account.error)
        throw new Error("Unable to load admin account details.");
      const office = offices.find((office) => office.id === profile.office_id);

      return {
        id: profile.id,
        name: profile.name,
        email: account.data.user?.email ?? "",
        status: profile.status,
        staffId: profile.staff_id,
        createdAt: profile.created_at,
        officeId: profile.office_id,
        officeName: office?.name ?? null,
      };
    }),
  );
}

export async function createAdmin(input: {
  name: string;
  email: string;
  staffId: string;
  officeName?: string;
}): Promise<
  | { ok: true; temporaryPassword: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<string, string>>;
    }
> {
  await requireRole(["super_admin"]);
  const supabase = createAdminClient();

  let officeId: string | undefined;

  if (input.officeName) {
    const officeResult = await getOrCreateOffice(input.officeName);

    if (!officeResult.ok) {
      return {
        ok: false,
        error: officeResult.error,
        fieldErrors: {
          officeName: officeResult.error,
        },
      };
    }

    officeId = officeResult.office.id;
  }

  const temporaryPassword = generateTemporaryPassword();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      name: input.name,
      staff_id: input.staffId,
    },
  });

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message ?? "Failed to create Admin account.",
    };
  }

  const userId = data.user.id;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: input.name,
      role: "admin",
      status: "active",
      staff_id: input.staffId,
      office_id: officeId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id")
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return {
      ok: false,
      error: `Admin account was created, but the profile could not be configured: ${profileError.message}`,
    };
  }

  return {
    ok: true,
    temporaryPassword,
  };
}

export async function updateAdmin(
  id: string,
  input: {
    name: string;
    email: string;
    staffId: string;
    officeName?: string;
  },
): Promise<
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<string, string>>;
    }
> {
  await requireRole(["super_admin"]);
  if (!(await isManagedAdmin(id)))
    return { ok: false, error: "Admin not found." };
  const supabase = createAdminClient();

  const { error: authError } = await supabase.auth.admin.updateUserById(id, {
    email: input.email,
    user_metadata: {
      name: input.name,
      staff_id: input.staffId,
    },
  });

  if (authError) {
    return {
      ok: false,
      error: authError.message,
    };
  }

  const { data: currentProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("office_id")
    .eq("id", id)
    .single();

  if (profileLookupError || !currentProfile) {
    return {
      ok: false,
      error: "Admin profile not found.",
    };
  }

  let officeId: string | null = null;

  if (input.officeName?.trim()) {
    const officeResult = await getOrCreateOffice(input.officeName);

    if (!officeResult.ok) {
      return {
        ok: false,
        error: officeResult.error,
        fieldErrors: {
          officeName: officeResult.error,
        },
      };
    }

    officeId = officeResult.office.id;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: input.name,
      staff_id: input.staffId,
      office_id: officeId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "admin");

  if (profileError) {
    return {
      ok: false,
      error: profileError.message,
    };
  }

  return { ok: true };
}

export async function setAdminStatus(
  id: string,
  status: AdminRow["status"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole(["super_admin"]);
  if (!(await isManagedAdmin(id)))
    return { ok: false, error: "Admin not found." };
  if (!["active", "inactive", "suspended", "archived"].includes(status))
    return { ok: false, error: "Invalid account status." };
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "admin");

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await invalidateSessions(id);
  return { ok: true };
}

export async function resetAdminPassword(
  id: string,
): Promise<
  { ok: true; temporaryPassword: string } | { ok: false; error: string }
> {
  await requireRole(["super_admin"]);
  if (!(await isManagedAdmin(id)))
    return { ok: false, error: "Admin not found." };
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

async function isManagedAdmin(id: string) {
  const { data, error } = await createAdminClient()
    .from("profiles")
    .select("id")
    .eq("id", id)
    .eq("role", "admin")
    .maybeSingle();
  return !error && Boolean(data);
}

import "server-only";
import { collectRows } from "@/shared/data/pagination";
import { cacheRequest } from "@/shared/security/request-cache";
import { requireRole } from "@/shared/rbac";

import { createAdminClient } from "@/supabase/admin";
import type { Office } from "@/modules/super-admin/shared/types";

type ProfileRow = {
  id: string;
  name: string;
  role: "student" | "tutor" | "admin" | "super_admin";
  office_id: string | null;
};

type OfficeRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

function mapOffice(office: OfficeRow, profiles: ProfileRow[]): Office {
  const officeProfiles = profiles.filter(
    (profile) => profile.office_id === office.id,
  );

  const assignedAdmin = officeProfiles.find(
    (profile) => profile.role === "admin",
  );

  const totalStudents = officeProfiles.filter(
    (profile) => profile.role === "student",
  ).length;

  return {
    id: office.id,
    name: office.name,
    adminId: assignedAdmin?.id ?? null,
    adminName: assignedAdmin?.name ?? null,
    totalStudents,
    totalRevenueNaira: 0,
  };
}

async function loadOffices(): Promise<Office[]> {
  await requireRole(["super_admin"]);
  const supabase = createAdminClient();

  const [offices, profiles, income] = await Promise.all([
    collectRows<OfficeRow>(
      supabase
        .from("offices")
        .select("id,name,created_at,updated_at")
        .order("id"),
    ),
    collectRows<ProfileRow>(
      supabase.from("profiles").select("id,name,role,office_id").order("id"),
    ),
    collectRows<{
      office_id: string;
      payload: { status: string; amountNaira: number };
    }>(
      supabase
        .from("lms_records")
        .select("id,office_id,payload")
        .eq("kind", "payment")
        .order("id"),
    ),
  ]);
  offices.sort((a, b) => a.name.localeCompare(b.name));
  const accountMetadata = new Map(
    await Promise.all(
      ((profiles ?? []) as ProfileRow[])
        .filter((p) => p.role === "tutor" || p.role === "admin")
        .map(async (p) => {
          const account = await supabase.auth.admin.getUserById(p.id);
          if (account.error)
            throw new Error("Unable to load company staffing details.");
          return [p.id, account.data.user?.user_metadata ?? {}] as const;
        }),
    ),
  );
  return (offices ?? []).map((office) => ({
    totalStaff: (profiles ?? []).filter(
      (p) => p.office_id === office.id && ["admin", "tutor"].includes(p.role),
    ).length,
    totalInterns: (profiles ?? []).filter(
      (p) =>
        p.office_id === office.id &&
        p.role === "tutor" &&
        accountMetadata.get(p.id)?.staffType === "intern",
    ).length,
    state:
      accountMetadata.get(
        (profiles ?? []).find(
          (p) => p.office_id === office.id && p.role === "admin",
        )?.id ?? "",
      )?.officeState ?? "",

    ...mapOffice(office as OfficeRow, (profiles ?? []) as ProfileRow[]),
    totalRevenueNaira: (income ?? [])
      .filter(
        (record) =>
          record.office_id === office.id && record.payload.status === "paid",
      )
      .reduce(
        (total, record) =>
          total +
          (Number.isFinite(record.payload.amountNaira)
            ? record.payload.amountNaira
            : 0),
        0,
      ),
  }));
}

export const getOffices = cacheRequest(loadOffices);

export async function findOfficeByName(
  name: string,
): Promise<OfficeRow | null> {
  await requireRole(["super_admin"]);
  const supabase = createAdminClient();

  const normalizedName = name.trim();

  if (!normalizedName) {
    return null;
  }

  const { data, error } = await supabase
    .from("offices")
    .select("id, name, created_at, updated_at")
    .ilike("name", normalizedName)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find office: ${error.message}`);
  }

  return data as OfficeRow | null;
}

export async function createOffice(
  name: string,
): Promise<{ ok: true; office: OfficeRow } | { ok: false; error: string }> {
  await requireRole(["super_admin"]);
  const supabase = createAdminClient();

  const normalizedName = name.trim();

  if (!normalizedName) {
    return {
      ok: false,
      error: "Office name is required.",
    };
  }

  const existingOffice = await findOfficeByName(normalizedName);

  if (existingOffice) {
    return {
      ok: true,
      office: existingOffice,
    };
  }

  const { data, error } = await supabase
    .from("offices")
    .insert({
      name: normalizedName,
    })
    .select("id, name, created_at, updated_at")
    .single();

  if (error) {
    return {
      ok: false,
      error: `Failed to create office: ${error.message}`,
    };
  }

  return {
    ok: true,
    office: data as OfficeRow,
  };
}

export async function getOrCreateOffice(
  name: string,
): Promise<{ ok: true; office: OfficeRow } | { ok: false; error: string }> {
  await requireRole(["super_admin"]);
  return createOffice(name);
}

export async function assignAdminToOffice(
  officeId: string,
  adminId: string,
  adminName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole(["super_admin"]);
  const supabase = createAdminClient();

  const { data: office, error: officeError } = await supabase
    .from("offices")
    .select("id")
    .eq("id", officeId)
    .maybeSingle();

  if (officeError) {
    return {
      ok: false,
      error: `Failed to verify office: ${officeError.message}`,
    };
  }

  if (!office) {
    return {
      ok: false,
      error: "Office not found.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      office_id: officeId,
      name: adminName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", adminId)
    .eq("role", "admin");

  if (error) {
    return {
      ok: false,
      error: `Failed to assign admin to office: ${error.message}`,
    };
  }

  return { ok: true };
}

export async function unassignOffice(
  officeId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole(["super_admin"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      office_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("office_id", officeId)
    .eq("role", "admin");

  if (error) {
    return {
      ok: false,
      error: `Failed to unassign office: ${error.message}`,
    };
  }

  return { ok: true };
}

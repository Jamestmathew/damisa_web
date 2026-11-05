import "server-only";
import { collectRows } from "./pagination";
import { createAdminClient } from "@/supabase/admin";
import { getContext } from "@/shared/security/context";
import { listRecords } from "./records";
import type { AccountStatus, Role } from "@/shared/rbac";
export interface OfficePerson {
  id: string;
  name: string;
  role: Role;
  status: AccountStatus;
  matric_number: string | null;
  staff_id: string | null;
  created_at: string;
  email: string;
}
export async function getOfficePeople(
  includeEmails = false,
  role?: Role,
): Promise<OfficePerson[]> {
  const { user, officeId } = await getContext();
  if (!["admin", "tutor"].includes(user.role))
    throw new Error("Access denied.");
  const db = createAdminClient();
  let profiles = await collectRows<Omit<OfficePerson, "email">>(
    db
      .from("profiles")
      .select("id,name,role,status,matric_number,staff_id,created_at")
      .eq("office_id", officeId)
      .order("id"),
  );
  if (user.role === "tutor") {
    const courses = new Set((await listRecords("course")).map((c) => c.id));
    const classes = await listRecords<{
      courseIds?: string[];
      studentIds?: string[];
    }>("class");
    const ids = new Set(
      classes
        .filter((c) => c.courseIds?.some((id) => courses.has(id)))
        .flatMap((c) => c.studentIds ?? []),
    );
    profiles = profiles.filter((p) => p.role === "student" && ids.has(p.id));
  }
  if (role) profiles = profiles.filter((p) => p.role === role);
  if (!includeEmails) return profiles.map((p) => ({ ...p, email: "" }));
  return Promise.all(
    profiles.map(async (p) => {
      const { data, error } = await db.auth.admin.getUserById(p.id);
      if (error) throw new Error("Unable to load account details.");
      return { ...p, email: data.user?.email ?? "" };
    }),
  );
}

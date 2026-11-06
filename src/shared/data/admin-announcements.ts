import "server-only";
import { getContext } from "@/shared/security/context";
import { createAdminClient } from "@/supabase/admin";
import { collectRows } from "./pagination";
import type { AdminAnnouncement } from "@/modules/admin/features/announcements/types";
export async function getStaffAnnouncements() {
  const { user, officeId } = await getContext();
  if (user.role !== "tutor") throw new Error("Access denied.");
  const db = createAdminClient();
  const admins = await db
    .from("profiles")
    .select("id")
    .eq("office_id", officeId)
    .eq("role", "admin");
  if (admins.error) throw new Error("Unable to load office announcements.");
  if (!admins.data?.length) return [];
  const rows = await collectRows<{ id: string; payload: AdminAnnouncement }>(
    db
      .from("lms_records")
      .select("id,payload")
      .eq("office_id", officeId)
      .eq("kind", "announcement")
      .in(
        "owner_id",
        admins.data.map((a) => a.id),
      )
      .order("id"),
  );
  return rows
    .filter((r) => ["tutors", "everyone"].includes(r.payload.audience))
    .map((r) => ({ ...r.payload, id: r.id }))
    .reverse();
}

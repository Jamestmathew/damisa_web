import "server-only";
import { requireRole } from "@/shared/rbac";
import { createAdminClient } from "@/supabase/admin";
import { collectRows } from "@/shared/data/pagination";
import type { PaymentRecord } from "@/modules/admin/features/finance/types";
export async function getFinanceReports() {
  await requireRole(["super_admin"]);
  const db = createAdminClient();
  const [offices, records] = await Promise.all([
    db.from("offices").select("id,name"),
    collectRows<{ id: string; office_id: string; payload: PaymentRecord }>(
      db
        .from("lms_records")
        .select("id,office_id,payload")
        .eq("kind", "payment")
        .order("id"),
    ),
  ]);
  if (offices.error) throw new Error("Unable to load offices.");
  return records.map((r) => ({
    ...r.payload,
    id: r.id,
    officeId: r.office_id,
    officeName:
      offices.data?.find((o) => o.id === r.office_id)?.name ?? "Office",
  }));
}

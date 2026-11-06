import { requireRole } from "@/shared/rbac";
import { createAdminClient } from "@/supabase/admin";
import { collectRows } from "@/shared/data/pagination";
import { getOffices } from "@/modules/super-admin/features/offices";
import { PageHeader } from "@/shared/components";
export default async function Page() {
  await requireRole(["super_admin"]);
  const db = createAdminClient();
  const [offices, people] = await Promise.all([
    getOffices(),
    collectRows<{
      id: string;
      name: string;
      role: string;
      status: string;
      office_id: string;
      staff_id: string;
    }>(
      db
        .from("profiles")
        .select("id,name,role,status,office_id,staff_id")
        .in("role", ["admin", "tutor"])
        .order("id"),
    ),
  ]);
  const rows = await Promise.all(
    people.map(async (p) => {
      const account = await db.auth.admin.getUserById(p.id);
      if (account.error) throw new Error("Unable to load staff details.");
      return {
        ...p,
        type:
          p.role === "admin"
            ? "Admin"
            : account.data.user?.user_metadata?.staffType === "intern"
              ? "Intern"
              : "Instructor",
      };
    }),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Interns"
        description="Your remote workforce across all companies and states. Admins manage instructors and interns within their own company."
      />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {[
                "Name",
                "Staff ID",
                "Type",
                "Company / branch",
                "State",
                "Status",
              ].map((h) => (
                <th key={h} className="p-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const office = offices.find((o) => o.id === p.office_id);
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.staff_id ?? "—"}</td>
                  <td className="p-3">{p.type}</td>
                  <td className="p-3">{office?.name ?? "Unassigned"}</td>
                  <td className="p-3">{office?.state || "Not set"}</td>
                  <td className="p-3 capitalize">{p.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <p className="p-6 text-muted-foreground">No staff accounts yet.</p>
        )}
      </div>
    </div>
  );
}

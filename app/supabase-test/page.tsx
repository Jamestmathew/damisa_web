import { requireRole } from "@/shared/rbac";
import { createAdminClient } from "@/supabase/admin";
export default async function SupabaseTestPage() {
  await requireRole(["super_admin"]);
  const { error } = await createAdminClient()
    .from("offices")
    .select("id")
    .limit(1);
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Database status</h1>
      <p>
        {error
          ? "The database is unavailable. Check the server configuration."
          : "The database connection is healthy."}
      </p>
    </main>
  );
}

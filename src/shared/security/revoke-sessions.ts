import "server-only";
import { createAdminClient } from "@/supabase/admin";
export async function invalidateSessions(userId: string): Promise<number> {
  const { data, error } = await createAdminClient().rpc(
    "bump_profile_session_version",
    { p_user_id: userId },
  );
  if (error)
    throw new Error("Unable to revoke existing sessions. Please retry.");
  return data as number;
}

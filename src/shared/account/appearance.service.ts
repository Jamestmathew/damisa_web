import "server-only";
import { requireAuth } from "@/modules/auth/lib/route-guard";
import { createAdminClient } from "@/supabase/admin";
import { cacheRequest } from "@/shared/security/request-cache";
import { appearancePreferencesSchema } from "@/modules/student/features/settings/validation/preferences.schema";
import { getPreferences } from "@/modules/student/features/settings/services/settings.service";
export const getAccountAppearance = cacheRequest(async () => {
  const user = await requireAuth();
  const account = await createAdminClient().auth.admin.getUserById(user.id);
  if (account.error)
    throw new Error("Unable to load your appearance preferences.");
  const parsed = appearancePreferencesSchema.safeParse(
    account.data.user?.user_metadata?.appearance,
  );
  if (parsed.success) return parsed.data;
  if (user.role === "student") return (await getPreferences()).appearance;
  return { theme: "system" as const, compactSidebar: false };
});

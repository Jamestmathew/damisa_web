"use server";
import { authorizeAction } from "@/shared/security/action";
import { createAdminClient } from "@/supabase/admin";
import { clearRequestCache } from "@/shared/security/request-cache";
import { revalidatePath } from "next/cache";
import { appearancePreferencesSchema } from "@/modules/student/features/settings/validation/preferences.schema";
import type { SettingsActionResult } from "@/modules/student/features/settings/types";
export async function saveAccountAppearanceAction(
  _state: SettingsActionResult | null,
  data: FormData,
): Promise<SettingsActionResult> {
  const user = await authorizeAction([
    "student",
    "tutor",
    "admin",
    "super_admin",
  ]);
  const parsed = appearancePreferencesSchema.safeParse({
    theme: data.get("theme"),
    compactSidebar: data.get("compactSidebar") === "on",
  });
  if (!parsed.success)
    return { ok: false, error: "Choose a valid theme and sidebar preference." };
  try {
    const db = createAdminClient();
    const current = await db.auth.admin.getUserById(user.id);
    if (current.error || !current.data.user)
      throw new Error("Unable to load your account.");
    const updated = await db.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...current.data.user.user_metadata,
        appearance: parsed.data,
      },
    });
    if (updated.error) throw new Error("Unable to save appearance.");
    await clearRequestCache();
    revalidatePath("/", "layout");
    return { ok: true, message: "Appearance saved." };
  } catch {
    return { ok: false, error: "Unable to save appearance. Please retry." };
  }
}

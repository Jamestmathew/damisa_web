"use server";
import { authorizeAction } from "@/shared/security/action";
import { requireRole } from "@/shared/rbac";

import { revalidatePath } from "next/cache";

import { appearancePreferencesSchema } from "../validation/preferences.schema";
import { updateAppearancePreferences } from "../services/settings.service";
import type { SettingsActionResult } from "../types";

export async function updateAppearanceAction(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  await authorizeAction(["student"]);
  await requireRole(["student"]);
  try {
    const parsed = appearancePreferencesSchema.safeParse({
      theme: formData.get("theme"),
      compactSidebar: formData.get("compactSidebar") === "on",
    });

    if (!parsed.success) {
      return { ok: false, error: "Please fix the errors below" };
    }

    await updateAppearancePreferences(parsed.data);
    revalidatePath("/student", "layout");

    return { ok: true, message: "Appearance preferences updated." };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

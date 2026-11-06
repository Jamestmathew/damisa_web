"use server";
import { saveAccountAppearanceAction } from "@/shared/account/save-appearance.action";
import type { SettingsActionResult } from "../types";
export async function updateAppearanceAction(
  state: SettingsActionResult | null,
  data: FormData,
) {
  return saveAccountAppearanceAction(state, data);
}

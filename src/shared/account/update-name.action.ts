"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { createAdminClient } from "@/supabase/admin";
import { clearRequestCache } from "@/shared/security/request-cache";
export async function updateAccountNameAction(data: FormData) {
  const user = await authorizeAction(["student", "tutor"]);
  const parsed = z.string().trim().min(2).max(150).safeParse(data.get("name"));
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Enter a name between 2 and 150 characters.",
    };
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ name: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error)
    return { ok: false as const, error: "Unable to update your name." };
  await clearRequestCache();
  revalidatePath("/", "layout");
  return { ok: true as const };
}

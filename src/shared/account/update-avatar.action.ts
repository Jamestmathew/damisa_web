"use server";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { getContext } from "@/shared/security/context";
import { clearRequestCache } from "@/shared/security/request-cache";
import { createAdminClient } from "@/supabase/admin";
import { uploadImage, removeImage } from "@/shared/media/storage";
export async function updateAvatarAction(data: FormData) {
  await authorizeAction(["student", "tutor"]);
  const { user, officeId } = await getContext();
  const file = data.get("avatar");
  if (!(file instanceof File) || !file.size)
    return { ok: false as const, error: "Choose a profile picture." };
  const db = createAdminClient();
  const previous = await db
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();
  let path: string | undefined;
  try {
    path = await uploadImage(file, `${officeId}/profiles/${user.id}`);
    const { error } = await db
      .from("profiles")
      .update({ avatar_url: path, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) throw new Error("Unable to update your profile picture.");
    if (
      previous.data?.avatar_url?.startsWith(`${officeId}/profiles/${user.id}/`)
    )
      await removeImage(previous.data.avatar_url).catch(() => {});
    await clearRequestCache();
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    if (path) await removeImage(path).catch(() => {});
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Unable to update picture.",
    };
  }
}

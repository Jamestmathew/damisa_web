"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { createAdminClient } from "@/supabase/admin";
import { collectRows } from "@/shared/data/pagination";
import { MEDIA_BUCKET } from "@/shared/media/storage";
const targetSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["student", "admin"]),
});
export async function deleteAccountAction(
  id: string,
  role: "student" | "admin",
) {
  const actor = await authorizeAction(["super_admin"]);
  const parsed = targetSchema.safeParse({ id, role });
  if (!parsed.success || id === actor.id)
    return { ok: false as const, error: "This account cannot be deleted." };
  const db = createAdminClient();
  const { data: target, error } = await db
    .from("profiles")
    .select("id,role,office_id,avatar_url")
    .eq("id", id)
    .eq("role", role)
    .maybeSingle();
  if (error || !target)
    return { ok: false as const, error: "Account not found." };
  // Company records survive deletion of the Admin who originally entered them.
  // Repoint audit references before Auth deletion so foreign keys remain valid.
  if (role === "admin") {
    const moved = await db
      .from("lms_records")
      .update({ owner_id: actor.id, updated_by: actor.id })
      .eq("owner_id", id);
    if (moved.error)
      return {
        ok: false as const,
        error: "Unable to preserve company records. No account was deleted.",
      };
  }
  const references = await db
    .from("lms_records")
    .update({ updated_by: actor.id })
    .eq("updated_by", id);
  if (references.error)
    return {
      ok: false as const,
      error: "Unable to preserve audit history. No account was deleted.",
    };
  if (role === "student") {
    const classes = await collectRows<{
      id: string;
      payload: { studentIds?: string[]; studentCount?: number };
      revision: number;
    }>(
      db
        .from("lms_records")
        .select("id,payload,revision")
        .eq("kind", "class")
        .contains("payload", { studentIds: [id] })
        .order("id"),
    );
    for (const item of classes) {
      const studentIds = (item.payload.studentIds ?? []).filter(
        (studentId) => studentId !== id,
      );
      const updated = await db
        .from("lms_records")
        .update({
          payload: {
            ...item.payload,
            studentIds,
            studentCount: studentIds.length,
          },
          updated_by: actor.id,
          revision: item.revision + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
        .eq("revision", item.revision)
        .select("id")
        .single();
      if (updated.error)
        return {
          ok: false as const,
          error: "Class enrollment changed. Refresh and retry deletion.",
        };
    }
  }
  const result = await db.auth.admin.deleteUser(id);
  if (result.error)
    return {
      ok: false as const,
      error: "The account could not be deleted. Please retry.",
    };
  if (
    target.office_id &&
    target.avatar_url?.startsWith(`${target.office_id}/profiles/${id}/`)
  )
    await db.storage.from(MEDIA_BUCKET).remove([target.avatar_url]);
  revalidatePath("/super-admin", "layout");
  revalidatePath("/admin", "layout");
  return { ok: true as const };
}

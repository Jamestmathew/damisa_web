import { getContext } from "@/shared/security/context";
import { createAdminClient } from "@/supabase/admin";
import { MEDIA_BUCKET } from "@/shared/media/storage";
export async function GET() {
  const { user, officeId } = await getContext();
  const db = createAdminClient();
  const { data } = await db
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();
  const path = data?.avatar_url;
  if (!path?.startsWith(`${officeId}/profiles/${user.id}/`))
    return new Response("Picture not found", { status: 404 });
  const file = await db.storage.from(MEDIA_BUCKET).download(path);
  if (file.error || !file.data)
    return new Response("Picture unavailable", { status: 404 });
  return new Response(file.data, {
    headers: {
      "Content-Type": file.data.type,
      "Cache-Control": "private, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

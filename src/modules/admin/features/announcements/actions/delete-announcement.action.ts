"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { deleteAnnouncement } from "../services/announcements.service";

export async function deleteAnnouncementAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["admin"]);
  const result = await deleteAnnouncement(id);

  if (result.ok) revalidatePath(ADMIN_ROUTES.announcements);

  return result;
}

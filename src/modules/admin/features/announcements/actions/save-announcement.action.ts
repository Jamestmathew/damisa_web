"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { announcementFormSchema } from "../validation/announcement-form.schema";
import {
  createAnnouncement,
  updateAnnouncement,
} from "../services/announcements.service";
import type { AnnouncementActionResult } from "../types";

export async function saveAnnouncementAction(
  _prevState: AnnouncementActionResult | null,
  formData: FormData,
): Promise<AnnouncementActionResult> {
  await authorizeAction(["admin"]);
  try {
    const parsed = announcementFormSchema.safeParse({
      id: formData.get("id") || undefined,
      title: formData.get("title"),
      body: formData.get("body"),
      audience: formData.get("audience"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          title: fieldErrors.title?.[0],
          body: fieldErrors.body?.[0],
          audience: fieldErrors.audience?.[0],
        },
      };
    }

    const { id, ...input } = parsed.data;
    const result = id
      ? await updateAnnouncement(id, input)
      : await createAnnouncement(input);

    if (!result.ok) return { ok: false, error: result.error };

    revalidatePath(ADMIN_ROUTES.announcements);

    return {
      ok: true,
      message: id ? "Announcement updated." : "Announcement posted.",
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

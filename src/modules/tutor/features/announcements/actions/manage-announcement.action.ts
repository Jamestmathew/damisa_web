"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { tutorAnnouncementFormSchema } from "../validation/announcement-form.schema";
import {
  createTutorAnnouncement,
  deleteTutorAnnouncement,
} from "../services/announcements.service";
import type { TutorAnnouncementActionResult } from "../types";

export async function createTutorAnnouncementAction(
  _prevState: TutorAnnouncementActionResult | null,
  formData: FormData,
): Promise<TutorAnnouncementActionResult> {
  await authorizeAction(["tutor"]);
  await requirePermission("courses:manage_own");

  const parsed = tutorAnnouncementFormSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "Please fix the errors below",
      fieldErrors: {
        courseId: fieldErrors.courseId?.[0],
        title: fieldErrors.title?.[0],
        body: fieldErrors.body?.[0],
      },
    };
  }

  const result = await createTutorAnnouncement(parsed.data);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(TUTOR_ROUTES.announcements);
  return { ok: true, message: "Announcement posted." };
}

export async function deleteTutorAnnouncementAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("courses:manage_own");

  const result = await deleteTutorAnnouncement(id);
  if (result.ok) revalidatePath(TUTOR_ROUTES.announcements);

  return result;
}

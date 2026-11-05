"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { getContext } from "@/shared/security/context";
import { createAdminClient } from "@/supabase/admin";
import { getOfficePeople } from "@/shared/data/people";
import { listRecords, invalidateRecordCache } from "@/shared/data/records";
import { uploadImage, removeImage } from "@/shared/media/storage";
const schema = z.object({
  title: z.string().trim().min(3).max(200),
  code: z.string().trim().min(2).max(40),
  description: z.string().trim().min(3).max(10000),
  creditUnits: z.coerce.number<number>().int().min(1).max(30),
  instructorId: z.string().uuid(),
  status: z.enum(["draft", "published"]),
});
export async function createAdminCourseAction(data: FormData) {
  await authorizeAction(["admin"]);
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Enter course details and select a tutor.",
    };
  const { user, officeId } = await getContext();
  const tutor = (await getOfficePeople()).find(
    (p) =>
      p.id === parsed.data.instructorId &&
      p.role === "tutor" &&
      p.status === "active",
  );
  if (!tutor)
    return {
      ok: false as const,
      error: "Choose an active tutor from your office.",
    };
  if (
    (await listRecords<{ code: string }>("course")).some(
      (c) => c.code.toLowerCase() === parsed.data.code.toLowerCase(),
    )
  )
    return {
      ok: false as const,
      error: "A course with this code already exists.",
    };
  const id = crypto.randomUUID();
  let coverPath: string | undefined;
  try {
    const file = data.get("cover");
    if (file instanceof File && file.size)
      coverPath = await uploadImage(file, `${officeId}/courses/${id}`);
    const { error } = await createAdminClient()
      .from("lms_records")
      .insert({
        id,
        kind: "course",
        office_id: officeId,
        owner_id: tutor.id,
        updated_by: user.id,
        payload: {
          ...parsed.data,
          instructorName: tutor.name,
          assessmentPolicy: { caWeight: 30, examWeight: 70 },
          studentCount: 0,
          moduleCount: 0,
          modules: [],
          ...(coverPath ? { coverPath } : {}),
        },
      });
    if (error) throw new Error("Unable to create the course.");
    await invalidateRecordCache();
    revalidatePath("/admin/courses");
    revalidatePath("/tutor/courses");
    return { ok: true as const };
  } catch (error) {
    if (coverPath) await removeImage(coverPath).catch(() => {});
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Unable to create the course.",
    };
  }
}

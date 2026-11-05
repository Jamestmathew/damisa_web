import { listRecords, commitCollection } from "@/shared/data/collections";
import "server-only";

import { getTutorCourseById } from "@/modules/tutor/features/courses/services/courses.service";
import type { TutorAnnouncement } from "../types";

function generateId() {
  return crypto.randomUUID();
}

export async function getTutorAnnouncements(): Promise<TutorAnnouncement[]> {
  const announcements: TutorAnnouncement[] =
    await listRecords<TutorAnnouncement>("announcement");

  return [...announcements].reverse();
}

export async function createTutorAnnouncement(input: {
  courseId: string;
  title: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const announcements: TutorAnnouncement[] =
    await listRecords<TutorAnnouncement>("announcement");
  const before = structuredClone(announcements);
  const result = await (async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    const course = await getTutorCourseById(input.courseId);

    announcements.push({
      id: generateId(),
      courseId: input.courseId,
      courseCode: course?.code ?? input.courseId,
      title: input.title,
      body: input.body,
      postedAt: "Just now",
    });

    return { ok: true };
  })();
  if (result.ok) await commitCollection("announcement", before, announcements);
  return result;
}

export async function deleteTutorAnnouncement(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const announcements: TutorAnnouncement[] =
    await listRecords<TutorAnnouncement>("announcement");
  const before = structuredClone(announcements);
  const result = await (async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    const index = announcements.findIndex((a) => a.id === id);
    if (index === -1) return { ok: false, error: "Announcement not found." };

    announcements.splice(index, 1);
    return { ok: true };
  })();
  if (result.ok) await commitCollection("announcement", before, announcements);
  return result;
}

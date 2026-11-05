import { listRecords, commitCollection } from "@/shared/data/collections";
import "server-only";

import type { AdminAnnouncement } from "../types";

function generateId() {
  return crypto.randomUUID();
}

export async function getAdminAnnouncements(): Promise<AdminAnnouncement[]> {
  const announcements: AdminAnnouncement[] =
    await listRecords<AdminAnnouncement>("announcement");

  return [...announcements].reverse();
}

export async function createAnnouncement(input: {
  title: string;
  body: string;
  audience: AdminAnnouncement["audience"];
}): Promise<
  { ok: true; announcement: AdminAnnouncement } | { ok: false; error: string }
> {
  const announcements: AdminAnnouncement[] =
    await listRecords<AdminAnnouncement>("announcement");
  const before = structuredClone(announcements);
  const result = await (async (): Promise<
    { ok: true; announcement: AdminAnnouncement } | { ok: false; error: string }
  > => {
    const announcement: AdminAnnouncement = {
      id: generateId(),
      title: input.title,
      body: input.body,
      audience: input.audience,
      postedAt: "Just now",
    };
    announcements.push(announcement);

    return { ok: true, announcement };
  })();
  if (result.ok) await commitCollection("announcement", before, announcements);
  return result;
}

export async function updateAnnouncement(
  id: string,
  input: {
    title: string;
    body: string;
    audience: AdminAnnouncement["audience"];
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const announcements: AdminAnnouncement[] =
    await listRecords<AdminAnnouncement>("announcement");
  const before = structuredClone(announcements);
  const result = await (async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    const announcement = announcements.find((a) => a.id === id);

    if (!announcement) return { ok: false, error: "Announcement not found." };

    announcement.title = input.title;
    announcement.body = input.body;
    announcement.audience = input.audience;

    return { ok: true };
  })();
  if (result.ok) await commitCollection("announcement", before, announcements);
  return result;
}

export async function deleteAnnouncement(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const announcements: AdminAnnouncement[] =
    await listRecords<AdminAnnouncement>("announcement");
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

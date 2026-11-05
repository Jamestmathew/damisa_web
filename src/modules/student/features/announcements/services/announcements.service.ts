import "server-only";
import { listRecords } from "@/shared/data/records";
import type { Announcement } from "../types";
export async function getAnnouncements(): Promise<Announcement[]> {
  return (
    await listRecords<{
      title: string;
      body: string;
      postedAt: string;
      courseCode?: string;
    }>("announcement")
  ).map((a) => ({ ...a, courseTitle: a.courseCode ?? null, isPinned: false }));
}

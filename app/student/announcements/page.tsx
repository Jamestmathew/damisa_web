import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import { getAnnouncements, AnnouncementList } from "@/modules/student/features/announcements";

export const metadata: Metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div>
      <PageHeader title="Announcements" description="Updates from your courses and school" />
      <AnnouncementList announcements={announcements} />
    </div>
  );
}

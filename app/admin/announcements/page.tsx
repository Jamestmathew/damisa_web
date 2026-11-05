import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getAdminAnnouncements, AnnouncementsManager } from "@/modules/admin/features/announcements";

export const metadata: Metadata = { title: "Announcements" };

export default async function AdminAnnouncementsPage() {
  const announcements = await getAdminAnnouncements();

  return (
    <div>
      <PageHeader title="Announcements" description="Post platform-wide or audience-specific announcements" />
      <AnnouncementsManager announcements={announcements} />
    </div>
  );
}

import { Megaphone } from "lucide-react";

import { EmptyState } from "@/modules/student/shared/components";
import type { Announcement } from "../types";

import { AnnouncementCard } from "./announcement-card";

export function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) {
    return <EmptyState icon={Megaphone} title="No announcements" description="Check back later for updates." />;
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}

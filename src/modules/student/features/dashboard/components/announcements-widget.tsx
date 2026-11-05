import Link from "next/link";
import { Megaphone } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/modules/student/shared/components";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { AnnouncementPreview } from "../types";

export function AnnouncementsWidget({ announcements }: { announcements: AnnouncementPreview[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Announcements</CardTitle>
        <Link href={STUDENT_ROUTES.announcements} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements" />
        ) : (
          <ul className="space-y-3">
            {announcements.map((announcement) => (
              <li key={announcement.id}>
                <p className="text-sm font-medium text-foreground">{announcement.title}</p>
                <p className="text-xs text-muted-foreground">
                  {announcement.courseTitle} · {announcement.postedAt}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

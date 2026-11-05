import { Pin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Announcement } from "../types";

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {announcement.isPinned ? <Pin className="size-4 text-primary" /> : null}
            <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
          </div>
          <Badge variant="outline">{announcement.courseTitle ?? "School-wide"}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{announcement.body}</p>
        <p className="text-xs text-muted-foreground">{announcement.postedAt}</p>
      </CardContent>
    </Card>
  );
}

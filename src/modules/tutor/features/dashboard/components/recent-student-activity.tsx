import { Activity } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import type { RecentStudentActivity } from "../types";

export function RecentStudentActivityWidget({ activities }: { activities: RecentStudentActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Student Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState icon={Activity} title="No recent activity" />
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="text-sm">
                <span className="font-medium text-foreground">{activity.studentName}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium text-foreground">{activity.courseTitle}</span>
                <p className="text-xs text-muted-foreground">{activity.occurredAt}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

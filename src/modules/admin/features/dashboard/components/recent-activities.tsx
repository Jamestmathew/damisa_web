import { History } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import type { RecentActivity } from "../types";

export function RecentActivities({ activities }: { activities: RecentActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState icon={History} title="No recent activity" />
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="text-sm">
                <span className="font-medium text-foreground">{activity.actor}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium text-foreground">{activity.target}</span>
                <p className="text-xs text-muted-foreground">{activity.occurredAt}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

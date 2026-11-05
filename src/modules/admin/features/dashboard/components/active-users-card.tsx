import { Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ActiveUsersCard({ count, delta }: { count: number; delta: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="rounded-md bg-secondary p-2">
          <Users className="size-4 text-secondary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Active users (last 24h)</p>
          <p className="text-xl font-semibold text-foreground">{count.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{delta}</p>
        </div>
      </CardContent>
    </Card>
  );
}

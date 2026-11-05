import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProgressOverviewCard({ overallPercent }: { overallPercent: number }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-secondary p-2">
            <TrendingUp className="size-4 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overall completion</p>
            <p className="text-2xl font-semibold text-foreground">{overallPercent}%</p>
          </div>
        </div>
        <Progress value={overallPercent} />
      </CardContent>
    </Card>
  );
}

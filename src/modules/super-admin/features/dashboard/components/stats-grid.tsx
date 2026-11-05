import { ShieldCheck, Building2, GraduationCap, Wallet, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { SuperAdminStat } from "../types";

const ICON_MAP: Record<SuperAdminStat["icon"], LucideIcon> = {
  admins: ShieldCheck,
  offices: Building2,
  students: GraduationCap,
  revenue: Wallet,
};

export function SuperAdminStatsGrid({ stats }: { stats: SuperAdminStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = ICON_MAP[stat.icon];
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
                {stat.hint ? <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p> : null}
              </div>
              <div className="rounded-md bg-secondary p-2">
                <Icon className="size-4 text-secondary-foreground" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

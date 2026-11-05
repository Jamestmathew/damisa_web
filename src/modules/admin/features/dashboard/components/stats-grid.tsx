import {
  Users,
  GraduationCap,
  Presentation,
  BookOpen,
  Wallet,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { AdminStat } from "../types";

const ICON_MAP: Record<AdminStat["icon"], LucideIcon> = {
  users: Users,
  students: GraduationCap,
  teachers: Presentation,
  courses: BookOpen,
  revenue: Wallet,
  admissions: ClipboardCheck,
};

export function AdminStatsGrid({ stats }: { stats: AdminStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = ICON_MAP[stat.icon];
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{stat.value}</p>
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

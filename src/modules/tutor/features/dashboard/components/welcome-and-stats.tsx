import { BookOpen, Users, ClipboardList, HelpCircle, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { TutorStat } from "../types";

export function TutorWelcomeCard({ firstName }: { firstName: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="p-6">
        <p className="text-lg font-semibold">{greeting}, {firstName} 👋</p>
        <p className="mt-1 text-sm text-primary-foreground/80">
          Here&apos;s what&apos;s happening across your courses today.
        </p>
      </CardContent>
    </Card>
  );
}

const ICON_MAP: Record<TutorStat["icon"], LucideIcon> = {
  courses: BookOpen,
  students: Users,
  pending: ClipboardList,
  quizzes: HelpCircle,
};

export function TutorStatsGrid({ stats }: { stats: TutorStat[] }) {
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

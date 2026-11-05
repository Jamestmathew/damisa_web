import Link from "next/link";
import { Megaphone, Hammer, ClipboardList, HelpCircle, BarChart3 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import type { TutorAnnouncementPreview } from "../types";

export function TutorAnnouncementsWidget({ announcements }: { announcements: TutorAnnouncementPreview[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Announcements</CardTitle>
        <Link href={TUTOR_ROUTES.announcements} className="text-sm text-primary hover:underline">
          Manage
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
                <p className="text-xs text-muted-foreground">{announcement.postedAt}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const ACTIONS = [
  { label: "New Course", href: TUTOR_ROUTES.newCourse, icon: Hammer },
  { label: "Review Assignments", href: TUTOR_ROUTES.assignments, icon: ClipboardList },
  { label: "Manage Quizzes", href: TUTOR_ROUTES.quizzes, icon: HelpCircle },
  { label: "Open Gradebook", href: TUTOR_ROUTES.gradebook, icon: BarChart3 },
];

export function TutorQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Button key={action.href} asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href={action.href}>
              <action.icon className="size-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

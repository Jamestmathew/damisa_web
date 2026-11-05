import Link from "next/link";
import { UserPlus, ClipboardCheck, Megaphone, FileBarChart } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";

const ACTIONS = [
  { label: "Add User", href: `${ADMIN_ROUTES.users}?action=create`, icon: UserPlus },
  { label: "Review Admissions", href: ADMIN_ROUTES.admissions, icon: ClipboardCheck },
  { label: "New Announcement", href: `${ADMIN_ROUTES.announcements}?action=create`, icon: Megaphone },
  { label: "View Reports", href: ADMIN_ROUTES.reports, icon: FileBarChart },
];

export function AdminQuickActions() {
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

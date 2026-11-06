import Link from "next/link";
import {
  UserPlus,
  ClipboardCheck,
  Megaphone,
  FileBarChart,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";

const ACTIONS = [
  { label: "Students", href: ADMIN_ROUTES.students, icon: UserPlus },
  { label: "Staff", href: ADMIN_ROUTES.teachers, icon: ClipboardCheck },
  {
    label: "Announcements",
    href: ADMIN_ROUTES.announcements,
    icon: Megaphone,
  },
  { label: "Finance", href: ADMIN_ROUTES.finance, icon: FileBarChart },
];

export function AdminQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Button
            key={action.href}
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
          >
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

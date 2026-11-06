import Link from "next/link";
import { ClipboardList, BookOpen, BarChart3, Wallet } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";

const ACTIONS = [
  {
    label: "View Assignments",
    href: STUDENT_ROUTES.assignments,
    icon: ClipboardList,
  },
  { label: "My courses", href: STUDENT_ROUTES.courses, icon: BookOpen },
  { label: "Check Grades", href: STUDENT_ROUTES.grades, icon: BarChart3 },
  { label: "Payments", href: STUDENT_ROUTES.payments, icon: Wallet },
];

export function QuickActions() {
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

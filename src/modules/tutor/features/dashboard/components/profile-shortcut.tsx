import Link from "next/link";
import { UserCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Tutor's "Profile Shortcut" feature is intentionally just this — a link
 * into the shared, cross-role Profile module. Profile itself isn't part
 * of the Tutor module (see the "globally shared features" list), so this
 * widget has no local profile logic to duplicate.
 */
export function ProfileShortcut({ tutorName }: { tutorName: string }) {
  return (
    <Link href="/profile">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <UserCircle className="size-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">{tutorName}</p>
            <p className="text-xs text-muted-foreground">View and edit your profile</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

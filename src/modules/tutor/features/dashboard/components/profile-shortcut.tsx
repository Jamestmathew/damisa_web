import Link from "next/link";
import { UserCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ProfileShortcut({ tutorName }: { tutorName: string }) {
  return (
    <Link href="/tutor/settings">
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <UserCircle className="size-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">{tutorName}</p>
            <p className="text-xs text-muted-foreground">
              View and edit your profile
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

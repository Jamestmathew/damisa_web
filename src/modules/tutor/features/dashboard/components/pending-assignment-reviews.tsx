import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import { SubmissionStatusBadge } from "@/modules/tutor/shared/components";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import type { PendingReview } from "../types";

export function PendingAssignmentReviews({ reviews }: { reviews: PendingReview[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Pending Assignment Reviews</CardTitle>
        <Link href={TUTOR_ROUTES.assignments} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Nothing to review" description="You're all caught up." />
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{review.assignmentTitle}</p>
                  <p className="text-xs text-muted-foreground">{review.studentName} · {review.courseTitle}</p>
                </div>
                <SubmissionStatusBadge status={review.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

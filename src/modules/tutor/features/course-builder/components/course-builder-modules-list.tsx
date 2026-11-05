import Link from "next/link";
import { Layers, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import type { CourseModuleSummary } from "../../courses/types";

export function CourseBuilderModulesList({
  courseId,
  modules,
}: {
  courseId: string;
  modules: CourseModuleSummary[];
}) {
  if (modules.length === 0) {
    return <EmptyState icon={Layers} title="No modules yet" description="Add your first module below." />;
  }

  return (
    <div className="space-y-2">
      {modules.map((module) => (
        <Link key={module.id} href={TUTOR_ROUTES.lessons(courseId)}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">{module.title}</p>
                <p className="text-xs text-muted-foreground">{module.lessonCount} lessons</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

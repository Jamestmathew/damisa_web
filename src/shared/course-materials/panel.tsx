import { getRecord } from "@/shared/data/records";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CourseMaterialUploader } from "./uploader";
import { formatCourseBytes } from "./policy";
import type { MaterialCourse } from "./service";
export async function CourseMaterials({
  courseId,
  editable = false,
}: {
  courseId: string;
  editable?: boolean;
}) {
  const course = await getRecord<MaterialCourse>("course", courseId);
  if (!course) return null;
  const materials = course.materials ?? [];
  const ready = materials.filter((m) => m.status === "ready");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Course files & PDFs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editable && (
          <CourseMaterialUploader courseId={courseId} materials={materials} />
        )}
        {ready.length ? (
          <ul className="space-y-2">
            {ready.map((m) => (
              <li key={m.id}>
                <a
                  className="block rounded-md border p-3 text-sm text-primary underline"
                  href={`/api/courses/${courseId}/materials/${m.id}`}
                >
                  Download {m.fileName}{" "}
                  <span className="text-muted-foreground">
                    ({formatCourseBytes(m.sizeBytes)})
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          !editable && (
            <p className="text-sm text-muted-foreground">
              No course files uploaded yet.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}

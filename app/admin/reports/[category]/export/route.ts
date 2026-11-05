import { authorizeAction } from "@/shared/security/action";
import { listRecords } from "@/shared/data/records";
import { getOfficePeople } from "@/shared/data/people";
import { toCsv } from "@/shared/data/csv";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  await authorizeAction(["admin"]);
  const { category } = await params;
  let rows: Record<string, unknown>[];
  if (category === "academic")
    rows = (await getOfficePeople())
      .filter((p) => p.role === "student")
      .map((p) => ({
        name: p.name,
        matricNumber: p.matric_number,
        status: p.status,
        createdAt: p.created_at,
      }));
  else if (category === "financial")
    rows = await listRecords<Record<string, unknown>>("payment");
  else if (category === "attendance")
    rows = await listRecords<Record<string, unknown>>("attendance");
  else return new Response("Report not found", { status: 404 });
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${category}-report.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

import "server-only";
import { requireRole } from "@/shared/rbac";
import { createAdminClient } from "@/supabase/admin";
import { collectRows } from "@/shared/data/pagination";
import { studentBalance, type StudentFee } from "@/shared/data/balance";
import type { Role, AccountStatus } from "@/shared/rbac";
export interface PlatformStudent {
  id: string;
  name: string;
  matricNumber: string;
  officeName: string;
  classNames: string[];
  status: AccountStatus;
  totalDueNaira: number | null;
  paidNaira: number;
  remainingNaira: number | null;
  creditNaira: number;
  attendancePercent: number | null;
  completedLessons: number;
}
interface Profile {
  id: string;
  name: string;
  matric_number: string | null;
  office_id: string | null;
  status: AccountStatus;
  role: Role;
}
interface RecordRow {
  office_id: string;
  owner_id: string;
  kind: string;
  payload: Record<string, unknown>;
}
export async function getPlatformStudents(): Promise<PlatformStudent[]> {
  await requireRole(["super_admin"]);
  const db = createAdminClient();
  const [people, offices, records] = await Promise.all([
    collectRows<Profile>(
      db
        .from("profiles")
        .select("id,name,matric_number,office_id,status,role")
        .eq("role", "student")
        .order("id"),
    ),
    collectRows<{ id: string; name: string }>(
      db.from("offices").select("id,name").order("id"),
    ),
    collectRows<RecordRow>(
      db
        .from("lms_records")
        .select("office_id,owner_id,kind,payload")
        .in("kind", [
          "class",
          "student_fee",
          "payment",
          "attendance",
          "lesson_progress",
        ])
        .order("id"),
    ),
  ]);
  return people.map((person) => {
    const scoped = records.filter((r) => r.office_id === person.office_id);
    const fee = scoped.find(
      (r) => r.kind === "student_fee" && r.payload.studentId === person.id,
    )?.payload as unknown as StudentFee | undefined;
    const payments = scoped
      .filter((r) => r.kind === "payment" && r.payload.studentId === person.id)
      .map((r) => ({
        amountNaira: Number(r.payload.amountNaira),
        status: String(r.payload.status),
      }));
    const attendance = scoped.filter(
      (r) => r.kind === "attendance" && r.payload.studentId === person.id,
    );
    return {
      id: person.id,
      name: person.name,
      matricNumber: person.matric_number ?? "",
      officeName:
        offices.find((o) => o.id === person.office_id)?.name ?? "Unassigned",
      classNames: scoped
        .filter(
          (r) =>
            r.kind === "class" &&
            (r.payload.studentIds as string[] | undefined)?.includes(person.id),
        )
        .map((r) => String(r.payload.name)),
      status: person.status,
      ...studentBalance(fee, payments),
      attendancePercent: attendance.length
        ? Math.round(
            (attendance.filter((r) => r.payload.mark !== "absent").length /
              attendance.length) *
              100,
          )
        : null,
      completedLessons: scoped.filter(
        (r) => r.kind === "lesson_progress" && r.owner_id === person.id,
      ).length,
    };
  });
}

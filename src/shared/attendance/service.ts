import "server-only";
import { requireRole } from "@/shared/rbac";
import { createAdminClient } from "@/supabase/admin";
import { collectRows } from "@/shared/data/pagination";
import type {
  AttendanceDay,
  AttendancePolicy,
  DailyEntry,
  AttendanceEvent,
} from "./types";
export async function getDailyAttendance(
  officeInput?: string,
  dateInput?: string,
) {
  const user = await requireRole(["admin", "super_admin"]);
  const db = createAdminClient();
  const offices =
    user.role === "super_admin"
      ? await db.from("offices").select("id,name").order("name")
      : await db
          .from("offices")
          .select("id,name")
          .eq("id", user.officeId ?? "00000000-0000-0000-0000-000000000000");
  if (offices.error) throw new Error("Unable to load offices.");
  const officeId =
    user.role === "admin"
      ? user.officeId
      : officeInput || offices.data?.[0]?.id;
  if (!officeId || !offices.data?.some((o) => o.id === officeId))
    return {
      offices: offices.data ?? [],
      officeId: null,
      date: "",
      policy: null,
      day: null,
      entries: [],
      events: [],
      needsMigration: false,
      canFinalize: false,
    };
  const policyQuery = await db
    .from("attendance_policies")
    .select("settings,effective_from")
    .eq("office_id", officeId)
    .order("effective_from", { ascending: false })
    .order("created_at", { ascending: false });
  if (policyQuery.error) {
    if (["42P01", "PGRST205"].includes(policyQuery.error.code))
      return {
        offices: offices.data ?? [],
        officeId,
        date: "",
        policy: null,
        day: null,
        entries: [],
        events: [],
        needsMigration: true,
        canFinalize: false,
      };
    throw new Error("Unable to load attendance policy.");
  }
  const latest = policyQuery.data?.[0]?.settings as
    | AttendancePolicy
    | undefined;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: latest?.timezone ?? "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const date =
    dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput) ? dateInput : today;
  const policy = (policyQuery.data ?? []).find((p) => p.effective_from <= date)
    ?.settings as AttendancePolicy | undefined;
  const dayQuery = await db
    .from("attendance_days")
    .select("*")
    .eq("office_id", officeId)
    .eq("attendance_date", date)
    .eq("audience", user.role === "admin" ? "student" : "staff")
    .maybeSingle();
  if (dayQuery.error) throw new Error("Unable to load attendance day.");
  const day = dayQuery.data as AttendanceDay | null;
  const entries = day
    ? await collectRows<DailyEntry>(
        db
          .from("attendance_entries")
          .select("*")
          .eq("day_id", day.id)
          .order("subject_name")
          .order("id"),
      )
    : [];
  const events = day
    ? await collectRows<AttendanceEvent>(
        db
          .from("attendance_events")
          .select("*")
          .eq("day_id", day.id)
          .order("recorded_at", { ascending: false })
          .order("id"),
      )
    : [];
  return {
    offices: offices.data ?? [],
    officeId,
    date,
    policy: policy ?? null,
    day,
    entries,
    events,
    needsMigration: false,
    canFinalize: !!day && Date.now() >= new Date(day.closes_at).valueOf(),
  };
}
export async function getOwnDailyHistory() {
  const user = await requireRole(["student", "tutor", "admin"]);
  const db = createAdminClient();
  const { data, error } = await db
    .from("attendance_entries")
    .select(
      "*,attendance_days!inner(attendance_date,policy_snapshot,office_id,finalized_at)",
    )
    .eq("subject_id", user.id)
    .order("attendance_days(attendance_date)", { ascending: false })
    .limit(90);
  if (error) {
    if (["42P01", "PGRST205"].includes(error.code)) return [];
    throw new Error("Unable to load your daily attendance.");
  }
  return (data ?? []) as unknown as (DailyEntry & {
    attendance_days: Pick<
      AttendanceDay,
      "attendance_date" | "policy_snapshot" | "office_id" | "finalized_at"
    >;
  })[];
}

export async function getTutorAttendanceReview(dateInput?: string) {
  const user = await requireRole(["admin"]);
  const db = createAdminClient();
  if (!user.officeId)
    return { date: "", entries: [] as DailyEntry[], timezone: "Africa/Lagos" };
  const { data: policy } = await db
    .from("attendance_policies")
    .select("settings")
    .eq("office_id", user.officeId)
    .order("effective_from", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const timezone =
    (policy?.settings as AttendancePolicy | undefined)?.timezone ??
    "Africa/Lagos";
  const date =
    dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? dateInput
      : new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
  const { data: day, error } = await db
    .from("attendance_days")
    .select("id,policy_snapshot")
    .eq("office_id", user.officeId)
    .eq("attendance_date", date)
    .eq("audience", "staff")
    .maybeSingle();
  if (error) {
    if (["42P01", "PGRST205"].includes(error.code))
      return { date, entries: [] as DailyEntry[], timezone };
    throw new Error("Unable to load Tutor attendance.");
  }
  const entries = day
    ? await collectRows<DailyEntry>(
        db
          .from("attendance_entries")
          .select("*")
          .eq("day_id", day.id)
          .eq("subject_role", "tutor")
          .order("subject_name")
          .order("id"),
      )
    : [];
  return {
    date,
    entries,
    timezone:
      (day?.policy_snapshot as AttendancePolicy | undefined)?.timezone ??
      timezone,
  };
}

"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/shared/security/action";
import { createAdminClient } from "@/supabase/admin";
const uuid = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const policySchema = z.object({
  timezone: z.string().min(1).max(80),
  studentStart: time,
  staffStart: time,
  closingTime: time,
  studentGrace: z.coerce.number<number>().int().min(0).max(180),
  staffGrace: z.coerce.number<number>().int().min(0).max(180),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1),
  dateOverrides: z.record(date, z.boolean()),
});
function refresh() {
  for (const path of [
    "/admin/attendance",
    "/admin/tutor-attendance",
    "/super-admin/attendance",
    "/student/attendance",
    "/tutor/my-attendance",
    "/admin/my-attendance",
  ])
    revalidatePath(path);
}
function failure(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unable to save attendance.";
  return { ok: false as const, error: message };
}
export async function saveAttendancePolicyAction(
  officeId: string,
  effectiveFrom: string,
  input: unknown,
) {
  try {
    const user = await authorizeAction(["super_admin"]);
    const settings = policySchema.parse(input);
    uuid.parse(officeId);
    date.parse(effectiveFrom);
    try {
      new Intl.DateTimeFormat("en", { timeZone: settings.timezone });
    } catch {
      throw new Error("Choose a valid timezone.");
    }
    const { error } = await createAdminClient().rpc("attendance_save_policy", {
      p_actor: user.id,
      p_office: officeId,
      p_from: effectiveFrom,
      p_settings: settings,
    });
    if (error) throw new Error(error.message);
    refresh();
    return { ok: true as const };
  } catch (e) {
    return failure(e);
  }
}
export async function openAttendanceDayAction(
  officeId: string,
  attendanceDate: string,
) {
  try {
    const user = await authorizeAction(["admin", "super_admin"]);
    uuid.parse(officeId);
    date.parse(attendanceDate);
    if (user.role === "admin" && officeId !== user.officeId)
      throw new Error("Office access denied.");
    const { error } = await createAdminClient().rpc("attendance_open_day", {
      p_actor: user.id,
      p_office: officeId,
      p_date: attendanceDate,
      p_audience: user.role === "admin" ? "student" : "staff",
    });
    if (error) throw new Error(error.message);
    refresh();
    return { ok: true as const };
  } catch (e) {
    return failure(e);
  }
}
const mutation = z.object({
  dayId: uuid,
  entryId: uuid.nullable(),
  action: z.enum(["check_in", "check_out", "correct", "excuse", "finalize"]),
  time: z.string().datetime({ offset: true }).nullable(),
  reason: z.string().trim().max(1000),
  revision: z.number().int().min(0),
  requestId: uuid,
  excused: z.boolean(),
});
export async function recordDailyAttendanceAction(input: unknown) {
  try {
    const user = await authorizeAction(["admin", "super_admin"]);
    const v = mutation.parse(input);
    const { error } = await createAdminClient().rpc("attendance_apply", {
      p_actor: user.id,
      p_day: v.dayId,
      p_entry: v.entryId,
      p_action: v.action,
      p_time: v.time,
      p_reason: v.reason,
      p_revision: v.revision,
      p_request: v.requestId,
      p_excused: v.excused,
    });
    if (error) throw new Error(error.message);
    refresh();
    return { ok: true as const };
  } catch (e) {
    return failure(e);
  }
}

export async function clockMyAttendanceAction(
  direction: unknown,
  requestId: unknown,
) {
  try {
    const user = await authorizeAction(["tutor", "admin"]);
    const action = z.enum(["check_in", "check_out"]).parse(direction);
    const request = uuid.parse(requestId);
    const { error } = await createAdminClient().rpc("attendance_self_clock", {
      p_actor: user.id,
      p_direction: action,
      p_request: request,
    });
    if (error) {
      if (["PGRST202", "42883"].includes(error.code))
        throw new Error(
          "Staff clock-in setup is pending. Please ask Super Admin to finish setup.",
        );
      throw new Error(error.message);
    }
    refresh();
    return { ok: true as const };
  } catch (e) {
    return failure(e);
  }
}

export async function reviewAttendanceAction(input: unknown) {
  try {
    const actor = await authorizeAction(["admin", "super_admin"]);
    const v = z
      .object({
        entryId: uuid,
        decision: z.enum(["approved", "rejected"]),
        reason: z.string().trim().max(1000),
        revision: z.number().int().min(0),
        requestId: uuid,
      })
      .parse(input);
    const { error } = await createAdminClient().rpc("attendance_review", {
      p_actor: actor.id,
      p_entry: v.entryId,
      p_decision: v.decision,
      p_reason: v.reason,
      p_revision: v.revision,
      p_request: v.requestId,
    });
    if (error) {
      if (["PGRST202", "42883"].includes(error.code))
        throw new Error(
          "Attendance approval setup is pending. Please ask Super Admin to finish setup.",
        );
      throw new Error(error.message);
    }
    refresh();
    return { ok: true as const };
  } catch (e) {
    return failure(e);
  }
}

"use client";
import { AttendanceApprovalControls } from "./approval-controls";
import { useState, useTransition } from "react";
import { attendanceLocalTime, attendanceInstant } from "./time";
import { Button } from "@/components/ui/button";
import {
  openAttendanceDayAction,
  recordDailyAttendanceAction,
  saveAttendancePolicyAction,
} from "./actions";
import type { AttendancePolicy, DailyEntry, AttendanceEvent } from "./types";
import type { getDailyAttendance } from "./service";
type Data = Awaited<ReturnType<typeof getDailyAttendance>>;
const inputClass = "rounded-md border bg-background px-3 py-2 text-sm";
const defaults: AttendancePolicy = {
  timezone: "Africa/Lagos",
  studentStart: "08:00",
  studentGrace: 10,
  staffStart: "07:30",
  staffGrace: 5,
  closingTime: "17:00",
  weekdays: [1, 2, 3, 4, 5],
  dateOverrides: {},
};
export function DailyAttendanceManager({
  data,
  staff,
}: {
  data: Data;
  staff: boolean;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<DailyEntry | null>(null);
  const [action, setAction] = useState<
    "check_in" | "check_out" | "correct" | "excuse"
  >("check_in");
  const [at, setAt] = useState("");
  const [reason, setReason] = useState("");
  const [policy, setPolicy] = useState<AttendancePolicy>(
    data.policy ?? defaults,
  );
  const [effective, setEffective] = useState(
    data.date || new Date().toISOString().slice(0, 10),
  );
  const [overrideDate, setOverrideDate] = useState("");
  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage("");
    start(async () => {
      try {
        const result = await fn();
        if (!result.ok) setMessage(result.error ?? "Unable to save.");
        else {
          setSelected(null);
          setMessage("Saved.");
        }
      } catch {
        setMessage("Unable to save. Please retry.");
      }
    });
  }
  function select(entry: DailyEntry, kind: typeof action) {
    setSelected(entry);
    setAction(kind);
    setReason("");
    setAt(
      attendanceLocalTime(
        kind === "check_out"
          ? new Date().toISOString()
          : (entry.check_in ?? new Date().toISOString()),
        zone,
      ),
    );
  }
  const zone =
    data.day?.policy_snapshot.timezone ??
    data.policy?.timezone ??
    "Africa/Lagos";
  const fmt = (v: string | null) =>
    v
      ? new Intl.DateTimeFormat("en-GB", {
          timeZone: zone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date(v))
      : "—";
  const entries = data.entries.filter((e) =>
    `${e.subject_name} ${e.subject_role} ${e.class_names.join(" ")}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {staff ? "Staff attendance" : "Student daily attendance"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {staff
          ? "Record Tutor and Admin arrivals. Super Admin is excluded."
          : "Record student arrivals for your office. Tutor course attendance is shown separately."}{" "}
        Times use {zone}.
      </p>
      <form
        className="flex flex-wrap gap-3"
        action={staff ? "/super-admin/attendance" : "/admin/attendance"}
      >
        {staff ? (
          <label>
            Office{" "}
            <select
              className={inputClass}
              name="office"
              defaultValue={data.officeId ?? ""}
            >
              {data.offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          Date{" "}
          <input
            className={inputClass}
            name="date"
            type="date"
            defaultValue={data.date}
          />
        </label>
        <Button type="submit">View</Button>
      </form>
      {message ? (
        <p role="status" className="rounded border p-3 text-sm">
          {message}
        </p>
      ) : null}
      {data.needsMigration ? (
        <p className="rounded border p-4">
          Daily attendance setup is pending. Apply the daily attendance SQL
          migration before recording arrivals.
        </p>
      ) : !data.officeId ? (
        <p>No office is assigned.</p>
      ) : (
        <>
          {staff ? (
            <details className="rounded border p-4">
              <summary className="cursor-pointer font-medium">
                Configure office attendance policy
              </summary>
              <form
                className="mt-4 grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() =>
                    saveAttendancePolicyAction(
                      data.officeId!,
                      effective,
                      policy,
                    ),
                  );
                }}
              >
                <label>
                  Effective from{" "}
                  <input
                    required
                    className={inputClass + " block w-full"}
                    type="date"
                    value={effective}
                    onChange={(e) => setEffective(e.target.value)}
                  />
                </label>
                <label>
                  Timezone{" "}
                  <input
                    required
                    className={inputClass + " block w-full"}
                    value={policy.timezone}
                    onChange={(e) =>
                      setPolicy({ ...policy, timezone: e.target.value })
                    }
                  />
                </label>
                {(["studentStart", "staffStart", "closingTime"] as const).map(
                  (key) => (
                    <label key={key}>
                      {key === "studentStart"
                        ? "Student start"
                        : key === "staffStart"
                          ? "Staff start"
                          : "Closing time"}
                      <input
                        required
                        className={inputClass + " block w-full"}
                        type="time"
                        value={policy[key]}
                        onChange={(e) =>
                          setPolicy({ ...policy, [key]: e.target.value })
                        }
                      />
                    </label>
                  ),
                )}
                {(["studentGrace", "staffGrace"] as const).map((key) => (
                  <label key={key}>
                    {key === "studentGrace"
                      ? "Student grace minutes"
                      : "Staff grace minutes"}
                    <input
                      required
                      className={inputClass + " block w-full"}
                      type="number"
                      min="0"
                      max="180"
                      value={policy[key]}
                      onChange={(e) =>
                        setPolicy({ ...policy, [key]: Number(e.target.value) })
                      }
                    />
                  </label>
                ))}
                <fieldset className="flex flex-wrap gap-3 sm:col-span-2">
                  <legend>Attendance days</legend>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (name, i) => (
                      <label key={name}>
                        <input
                          type="checkbox"
                          checked={policy.weekdays.includes(i)}
                          onChange={(e) =>
                            setPolicy({
                              ...policy,
                              weekdays: e.target.checked
                                ? [...policy.weekdays, i]
                                : policy.weekdays.filter((d) => d !== i),
                            })
                          }
                        />{" "}
                        {name}
                      </label>
                    ),
                  )}
                </fieldset>
                <div className="sm:col-span-2 flex flex-wrap gap-2 items-center">
                  <label>
                    Holiday/special date{" "}
                    <input
                      type="date"
                      className={inputClass}
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!overrideDate}
                    onClick={() =>
                      setPolicy({
                        ...policy,
                        dateOverrides: {
                          ...policy.dateOverrides,
                          [overrideDate]: false,
                        },
                      })
                    }
                  >
                    Set holiday
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!overrideDate}
                    onClick={() =>
                      setPolicy({
                        ...policy,
                        dateOverrides: {
                          ...policy.dateOverrides,
                          [overrideDate]: true,
                        },
                      })
                    }
                  >
                    Set active day
                  </Button>
                </div>
                <div className="sm:col-span-2">
                  {Object.entries(policy.dateOverrides).map(
                    ([date, active]) => (
                      <div key={date} className="text-sm">
                        {date}: {active ? "Active" : "Holiday"}{" "}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => {
                            const next = { ...policy.dateOverrides };
                            delete next[date];
                            setPolicy({ ...policy, dateOverrides: next });
                          }}
                        >
                          Remove override
                        </button>
                      </div>
                    ),
                  )}
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Changes apply to newly opened rosters. Existing rosters keep
                  their original policy.
                </p>
                <Button disabled={pending} type="submit">
                  Save policy
                </Button>
              </form>
            </details>
          ) : null}
          {!data.day ? (
            <div className="rounded border p-4 space-y-3">
              <p>
                {data.policy
                  ? "No roster has been opened for this date."
                  : "Super Admin must configure the office policy first."}
              </p>
              <Button
                disabled={pending || !data.policy}
                onClick={() =>
                  run(() => openAttendanceDayAction(data.officeId!, data.date))
                }
              >
                Open today’s roster
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm">
                {data.day.finalized_at
                  ? "Day finalized. Corrections require a reason."
                  : "Day open. Unmarked people remain pending until closing."}{" "}
                Arrival:{" "}
                {staff
                  ? data.day.policy_snapshot.staffStart
                  : data.day.policy_snapshot.studentStart}
                ; grace:{" "}
                {staff
                  ? data.day.policy_snapshot.staffGrace
                  : data.day.policy_snapshot.studentGrace}{" "}
                minutes; closing: {data.day.policy_snapshot.closingTime}.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                {(["pending", "present", "late", "absent"] as const).map(
                  (status) => (
                    <span
                      className="rounded border p-2 capitalize"
                      key={status}
                    >
                      {status}:{" "}
                      {
                        data.entries.filter(
                          (e) => e.calculated_status === status,
                        ).length
                      }
                    </span>
                  ),
                )}
                <span className="rounded border p-2">
                  Excused: {data.entries.filter((e) => e.excused).length}
                </span>
              </div>
              <label className="block text-sm">
                Filter by name or class{" "}
                <input
                  className={inputClass + " ml-2"}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {[
                        "Person",
                        "Arrival",
                        "Departure",
                        "Calculated",
                        "Late minutes",
                        "Excuse",
                        "Actions",
                        "Approval",
                      ].map((t) => (
                        <th className="p-2 text-left" key={t}>
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr className="border-t" key={entry.id}>
                        <td className="p-2">
                          {entry.subject_name}
                          <div className="text-xs text-muted-foreground">
                            {entry.subject_role} {entry.class_names.join(", ")}
                          </div>
                        </td>
                        <td className="p-2">{fmt(entry.check_in)}</td>
                        <td className="p-2">{fmt(entry.check_out)}</td>
                        <td className="p-2 capitalize">
                          {entry.calculated_status}
                        </td>
                        <td className="p-2">
                          {Math.ceil(entry.late_seconds / 60)}
                        </td>
                        <td className="p-2">
                          {entry.excused ? entry.excuse_reason : "—"}
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-2">
                            {!entry.check_in && !data.day!.finalized_at ? (
                              <Button
                                size="sm"
                                disabled={pending}
                                onClick={() =>
                                  run(() =>
                                    recordDailyAttendanceAction({
                                      dayId: data.day!.id,
                                      entryId: entry.id,
                                      action: "check_in",
                                      time: new Date().toISOString(),
                                      reason: "",
                                      revision: entry.revision,
                                      requestId: crypto.randomUUID(),
                                      excused: true,
                                    }),
                                  )
                                }
                              >
                                Arrived now
                              </Button>
                            ) : null}
                            {entry.check_in && !entry.check_out ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => select(entry, "check_out")}
                              >
                                Departure
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                select(
                                  entry,
                                  entry.check_in || data.day!.finalized_at
                                    ? "correct"
                                    : "check_in",
                                )
                              }
                            >
                              Enter time
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => select(entry, "excuse")}
                            >
                              {entry.excused ? "Revoke excuse" : "Excuse"}
                            </Button>
                          </div>
                        </td>
                        <td className="p-2">
                          {!staff || entry.subject_role === "admin" ? (
                            <AttendanceApprovalControls entry={entry} />
                          ) : (
                            <span className="capitalize">
                              {entry.approval_status ?? "pending"} — Admin
                              review
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!entries.length ? (
                <p>No matching people in this roster.</p>
              ) : null}
              {selected ? (
                <form
                  className="rounded border p-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    let instant: string | null = null;
                    if (action !== "excuse") {
                      try {
                        instant = attendanceInstant(at, zone);
                      } catch {
                        setMessage("Enter a valid arrival or departure time.");
                        return;
                      }
                    }
                    run(() =>
                      recordDailyAttendanceAction({
                        dayId: data.day!.id,
                        entryId: selected.id,
                        action,
                        time: instant,
                        reason,
                        revision: selected.revision,
                        requestId: crypto.randomUUID(),
                        excused: !selected.excused,
                      }),
                    );
                  }}
                >
                  <h2 className="font-medium">
                    {selected.subject_name}: {action.replace("_", " ")}
                  </h2>
                  {action !== "excuse" ? (
                    <label className="block">
                      Actual time ({zone})
                      <input
                        required
                        className={inputClass + " block w-full"}
                        type="datetime-local"
                        step="1"
                        value={at}
                        onChange={(e) => setAt(e.target.value)}
                      />
                      <span className="text-xs">
                        The original entry and the time it was recorded are
                        preserved.
                      </span>
                    </label>
                  ) : null}
                  <label className="block">
                    Reason{" "}
                    <textarea
                      className={inputClass + " block w-full"}
                      maxLength={1000}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required={action === "correct" || action === "excuse"}
                    />
                  </label>
                  <Button type="submit" disabled={pending}>
                    Save attendance
                  </Button>{" "}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelected(null)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : null}
              <Button
                variant="outline"
                disabled={
                  pending || !!data.day.finalized_at || !data.canFinalize
                }
                onClick={() =>
                  run(() =>
                    recordDailyAttendanceAction({
                      dayId: data.day!.id,
                      entryId: null,
                      action: "finalize",
                      time: null,
                      reason: "",
                      revision: 0,
                      requestId: crypto.randomUUID(),
                      excused: true,
                    }),
                  )
                }
              >
                Finalize day and mark unrecorded people absent
              </Button>
              <details className="rounded border p-4">
                <summary>Audit history ({data.events.length})</summary>
                <div className="mt-3 space-y-3">
                  {data.events.map((event) => (
                    <AuditEvent
                      key={event.id}
                      event={event}
                      entries={data.entries}
                      zone={zone}
                    />
                  ))}
                </div>
              </details>
            </>
          )}
        </>
      )}
    </div>
  );
}
function AuditEvent({
  event,
  entries,
  zone,
}: {
  event: AttendanceEvent;
  entries: DailyEntry[];
  zone: string;
}) {
  return (
    <div className="border-t pt-2 text-sm">
      <p>
        {entries.find((e) => e.id === event.entry_id)?.subject_name ?? "Roster"}{" "}
        — {event.action} —{" "}
        {new Intl.DateTimeFormat("en-GB", {
          timeZone: zone,
          dateStyle: "short",
          timeStyle: "medium",
        }).format(new Date(event.recorded_at))}
      </p>
      <p>
        Recorder: {event.actor_id ?? "System"}. {event.reason}
      </p>
      {event.old_value || event.new_value ? (
        <details>
          <summary>Original and updated facts</summary>
          <pre className="overflow-auto text-xs">
            {JSON.stringify(
              { before: event.old_value, after: event.new_value },
              null,
              2,
            )}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { clockMyAttendanceAction } from "./actions";
export function StaffSelfClock({
  checkedIn,
  checkedOut,
}: {
  checkedIn: boolean;
  checkedOut: boolean;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  function clock(direction: "check_in" | "check_out") {
    setMessage("");
    const requestId = crypto.randomUUID();
    start(async () => {
      try {
        const result = await clockMyAttendanceAction(direction, requestId);
        setMessage(
          result.ok
            ? direction === "check_in"
              ? "Clocked in."
              : "Clocked out."
            : result.error,
        );
      } catch {
        setMessage("Unable to record attendance. Please retry.");
      }
    });
  }
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h2 className="font-semibold">My clock-in / clock-out</h2>
      <p className="text-sm text-muted-foreground">
        Your current arrival or departure time is recorded automatically. You
        cannot backdate or edit it. Contact Super Admin if a correction or
        excuse is needed.
      </p>
      <div className="flex gap-3">
        <Button
          disabled={pending || checkedIn}
          onClick={() => clock("check_in")}
        >
          {pending ? "Saving…" : checkedIn ? "Clocked in" : "Clock in now"}
        </Button>
        <Button
          variant="outline"
          disabled={pending || !checkedIn || checkedOut}
          onClick={() => clock("check_out")}
        >
          {checkedOut ? "Clocked out" : "Clock out now"}
        </Button>
      </div>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </div>
  );
}

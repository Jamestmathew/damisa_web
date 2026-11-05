"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reviewAttendanceAction } from "./actions";
import type { DailyEntry } from "./types";
export function AttendanceApprovalControls({ entry }: { entry: DailyEntry }) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  function review(decision: "approved" | "rejected") {
    setMessage("");
    start(async () => {
      try {
        const result = await reviewAttendanceAction({
          entryId: entry.id,
          decision,
          reason,
          revision: entry.revision,
          requestId: crypto.randomUUID(),
        });
        setMessage(
          result.ok
            ? decision === "approved"
              ? "Approved."
              : "Rejected."
            : result.error,
        );
      } catch {
        setMessage("Unable to save approval. Please retry.");
      }
    });
  }
  return (
    <div className="space-y-2 min-w-48">
      <p className="capitalize">
        {entry.approval_status ?? "pending"} approval
      </p>
      {entry.review_reason ? (
        <p className="text-xs text-muted-foreground">{entry.review_reason}</p>
      ) : null}
      <input
        aria-label={`Review reason for ${entry.subject_name}`}
        className="w-full rounded border bg-background p-2 text-xs"
        maxLength={1000}
        placeholder="Reason (required to reject)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={
            pending ||
            entry.calculated_status === "pending" ||
            entry.approval_status === "approved"
          }
          onClick={() => review("approved")}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={
            pending ||
            entry.calculated_status === "pending" ||
            reason.trim().length < 5
          }
          onClick={() => review("rejected")}
        >
          Reject
        </Button>
      </div>
      {message ? (
        <p role="status" className="text-xs">
          {message}
        </p>
      ) : null}
    </div>
  );
}

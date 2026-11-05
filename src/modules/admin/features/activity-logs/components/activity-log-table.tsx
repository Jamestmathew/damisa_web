"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState, EntityToolbar } from "@/shared/components";
import type { ActivityCategory, ActivityLogEntry } from "../types";

const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  user: "User",
  academic: "Academic",
  finance: "Finance",
  system: "System",
};

const CATEGORY_VARIANT: Record<ActivityCategory, "outline" | "secondary" | "success" | "destructive"> = {
  user: "outline",
  academic: "secondary",
  finance: "success",
  system: "destructive",
};

export function ActivityLogTable({ logs }: { logs: ActivityLogEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (log) =>
        log.actor.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
    );
  }, [logs, query]);

  return (
    <div>
      <EntityToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search activity..." />

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="No activity found" />
      ) : (
        <ul className="space-y-3">
          {filtered.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0 text-sm">
                <span className="font-medium text-foreground">{log.actor}</span>{" "}
                <span className="text-muted-foreground">{log.action}</span>{" "}
                <span className="font-medium text-foreground">{log.target}</span>
                <p className="text-xs text-muted-foreground">{log.occurredAt}</p>
              </div>
              <Badge variant={CATEGORY_VARIANT[log.category]}>{CATEGORY_LABEL[log.category]}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

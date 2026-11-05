export type ActivityCategory = "user" | "academic" | "finance" | "system";

export interface ActivityLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  category: ActivityCategory;
  occurredAt: string;
}

/**
 * Student Module — shared cross-feature types.
 * Feature-specific types live in each feature's own `types/` folder and
 * extend/reference these where needed.
 *
 * Pagination/AsyncResult are re-exported from the global shared layer
 * (`@/shared/types`) so every module uses the same definitions.
 */

export type { Pagination, AsyncResult } from "@/shared/types";

export interface CourseSummary {
  coverPath?: string;
  coverUrl?: string;
  id: string;
  title: string;
  code: string;
  instructor: string;
  thumbnailColor: string; // placeholder swatch until real thumbnails exist
  progressPercent: number;
  creditUnits: number;
}

export type SubmissionStatus =
  | "not_submitted"
  | "submitted"
  | "graded"
  | "late"
  | "missed";

export type ScheduleStatus = "upcoming" | "ongoing" | "completed" | "missed";

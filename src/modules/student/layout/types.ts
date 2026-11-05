import type { IconName } from "@/shared/layout";

export interface StudentNavItem {
  label: string;
  href: string;
  icon: IconName;
  /** Matches nested routes too (e.g. /courses/[id]) when true. */
  matchPrefix?: boolean;
}

import type { IconName } from "./icon-map";

export type { IconName } from "./icon-map";

export interface RoleNavItem {
  label: string;
  href: string;
  icon: IconName;
  /** Matches nested routes too (e.g. /users/[id]) when true. */
  matchPrefix?: boolean;
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes conditionally, resolving conflicts.
 * Shared across the whole app — every module (auth, students, courses, etc.)
 * reuses this instead of re-implementing className merging.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

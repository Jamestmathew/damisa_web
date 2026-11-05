export const COURSE_SORT_OPTIONS = [
  { label: "Recently accessed", value: "recent" },
  { label: "Progress", value: "progress" },
  { label: "Name (A-Z)", value: "name" },
] as const;

export type CourseSortOption = (typeof COURSE_SORT_OPTIONS)[number]["value"];

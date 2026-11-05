"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface CourseFilterBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function CourseFilterBar({ value, onChange }: CourseFilterBarProps) {
  return (
    <div className="relative mb-4 max-w-sm">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search courses..."
        className="pl-9"
        aria-label="Search courses"
      />
    </div>
  );
}

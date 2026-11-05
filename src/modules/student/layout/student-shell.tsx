"use client";

import { useState, type ReactNode } from "react";

import { StudentSidebar } from "./student-sidebar";
import { StudentHeader } from "./student-header";
import { StudentFooter } from "./student-footer";

interface StudentShellProps {
  compactSidebar?: boolean;
  studentName: string;
  studentEmail: string;
  children: ReactNode;
}

export function StudentShell({
  compactSidebar = false,
  studentName,
  studentEmail,
  children,
}: StudentShellProps) {
  const [collapsed, setCollapsed] = useState(compactSidebar);

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <StudentHeader studentName={studentName} studentEmail={studentEmail} />
        <main className="container flex-1 py-6">{children}</main>
        <StudentFooter />
      </div>
    </div>
  );
}

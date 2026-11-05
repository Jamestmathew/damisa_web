"use client";

import { useState, type ReactNode } from "react";

import { CollapsibleSidebar } from "./collapsible-sidebar";
import { RoleHeader } from "./role-header";
import { RoleFooter } from "./role-footer";
import type { IconName, RoleNavItem } from "./types";

interface RoleShellProps {
  navItems: RoleNavItem[];
  homeHref: string;
  brandLabel: string;
  brandIcon: IconName;
  userName: string;
  userEmail: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}

export function RoleShell({
  navItems,
  homeHref,
  brandLabel,
  brandIcon,
  userName,
  userEmail,
  logoutAction,
  children,
}: RoleShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <CollapsibleSidebar
        items={navItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        brandLabel={brandLabel}
        brandIcon={brandIcon}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <RoleHeader
          userName={userName}
          userEmail={userEmail}
          navItems={navItems}
          homeHref={homeHref}
          brandLabel={brandLabel}
          brandIcon={brandIcon}
          logoutAction={logoutAction}
        />

        <main className="container flex-1 py-6">{children}</main>

        <RoleFooter label={brandLabel} />
      </div>
    </div>
  );
}

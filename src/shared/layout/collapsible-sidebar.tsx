"use client";
import { BrandLogo } from "@/shared/brand/logo";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SidebarNav } from "./sidebar-nav";
import type { IconName, RoleNavItem } from "./types";

interface CollapsibleSidebarProps {
  items: RoleNavItem[];
  collapsed: boolean;
  onToggle: () => void;
  brandLabel: string;
  brandIcon: IconName;
}

export function CollapsibleSidebar({
  items,
  collapsed,
  onToggle,
  brandLabel,
  brandIcon: _brandIcon,
}: CollapsibleSidebarProps) {
  return (
    <aside
      className={cn(
        "brand-sidebar hidden shrink-0 border-r border-border bg-card transition-all duration-200 md:flex md:flex-col",
        collapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <span className="flex items-center gap-2 text-sm font-semibold">
            <BrandLogo size={34} />
            {brandLabel}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={collapsed ? "mx-auto" : undefined}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <SidebarNav items={items} collapsed={collapsed} />
      </div>
    </aside>
  );
}

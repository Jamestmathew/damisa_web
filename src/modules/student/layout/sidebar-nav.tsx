"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { iconMap } from "@/shared/layout/icon-map";

import type { StudentNavItem } from "./types";

interface SidebarNavProps {
  items: StudentNavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

function isActive(pathname: string, item: StudentNavItem) {
  if (item.matchPrefix) return pathname.startsWith(item.href);
  return pathname === item.href;
}

export function SidebarNav({
  items,
  collapsed = false,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        const active = isActive(pathname, item);
        const Icon = iconMap[item.icon];

        return (
          <Link
            prefetch={false}
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

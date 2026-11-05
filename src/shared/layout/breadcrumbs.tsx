"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import type { RoleNavItem } from "./types";

function labelFor(segment: string, items: RoleNavItem[]) {
  const match = items.find((item) => item.href === `/${segment}`);
  if (match) return match.label;

  if (/^[a-z0-9_-]{6,}$/i.test(segment) && /\d/.test(segment)) return "Details";

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface BreadcrumbsProps {
  items: RoleNavItem[];
  homeHref: string;
}

export function Breadcrumbs({ items, homeHref }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Link
        prefetch={false}
        href={homeHref}
        className="flex items-center hover:text-foreground"
        aria-label="Dashboard"
      >
        <Home className="size-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {labelFor(segment, items)}
              </span>
            ) : (
              <Link
                prefetch={false}
                href={href}
                className="hover:text-foreground"
              >
                {labelFor(segment, items)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SidebarNav } from "./sidebar-nav";
import { iconMap } from "./icon-map";
import type { IconName, RoleNavItem } from "./types";

interface MobileNavProps {
  items: RoleNavItem[];
  brandLabel: string;
  brandIcon: IconName;
}

export function MobileNav({ items, brandLabel, brandIcon }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const BrandIcon = iconMap[brandIcon];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <BrandIcon className="size-5 text-primary" />
            {brandLabel}
          </SheetTitle>
        </SheetHeader>

        <div className="py-3">
          <SidebarNav items={items} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

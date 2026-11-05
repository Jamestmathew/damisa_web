"use client";
import { BrandLogo } from "@/shared/brand/logo";

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
import type { IconName, RoleNavItem } from "./types";

interface MobileNavProps {
  items: RoleNavItem[];
  brandLabel: string;
  brandIcon: IconName;
}

export function MobileNav({
  items,
  brandLabel,
  brandIcon: _brandIcon,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

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

      <SheetContent side="left" className="brand-sidebar w-64 p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <BrandLogo size={34} />
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

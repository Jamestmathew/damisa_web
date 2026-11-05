import { BrandLogo } from "@/shared/brand/logo";
import { CurrentUserAvatar } from "@/shared/account/current-user-avatar";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MobileNav } from "./mobile-nav";
import { Breadcrumbs } from "./breadcrumbs";
import type { IconName, RoleNavItem } from "./types";

interface RoleHeaderProps {
  userName: string;
  userEmail: string;
  navItems: RoleNavItem[];
  homeHref: string;
  brandLabel: string;
  brandIcon: IconName;
  logoutAction: () => Promise<void>;
}

export function RoleHeader({
  userName,
  userEmail,
  navItems,
  homeHref,
  brandLabel,
  brandIcon,
  logoutAction,
}: RoleHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <MobileNav
          items={navItems}
          brandLabel={brandLabel}
          brandIcon={brandIcon}
        />
        <span className="md:hidden">
          <BrandLogo size={30} />
        </span>
        <Breadcrumbs items={navItems} homeHref={homeHref} />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-none text-foreground">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>

        <CurrentUserAvatar name={userName} />

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}

"use client";

import { SessionGuard } from "./session-guard";
import type { SessionState } from "@/shared/security/session-state";
import * as React from "react";

import type { AuthUser } from "@/modules/auth/types";

/** Server-authenticated identity plus the browser activity/tab guard. */
const SessionContext = React.createContext<AuthUser | null>(null);

export function SessionProvider({
  user,
  sessionState,
  children,
}: {
  user: AuthUser | null;
  sessionState: SessionState | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={user}>
      <SessionGuard state={sessionState}>{children}</SessionGuard>
    </SessionContext.Provider>
  );
}

export function useSession(): {
  user: AuthUser | null;
  isAuthenticated: boolean;
} {
  const user = React.useContext(SessionContext);
  return { user, isAuthenticated: user !== null };
}

"use client";

import * as React from "react";

import type { AuthUser } from "@/modules/auth/types";

/**
 * Deliberately minimal: a server component (e.g. the root layout) reads the
 * cookie session once and passes the resulting user down as a prop. No
 * client-side fetching, no global store — just React context so deeply
 * nested client components (header, avatar menu) can read "who is signed in"
 * without prop drilling.
 */
const SessionContext = React.createContext<AuthUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSession(): { user: AuthUser | null; isAuthenticated: boolean } {
  const user = React.useContext(SessionContext);
  return { user, isAuthenticated: user !== null };
}

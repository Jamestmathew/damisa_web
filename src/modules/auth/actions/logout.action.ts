"use server";

import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/modules/auth/constants";
import { createClient } from "@/supabase/server";

import { clearSessionBoundary } from "@/shared/security/session";

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();

  await supabase.auth.signOut();
  await clearSessionBoundary();

  redirect(AUTH_ROUTES.afterLogout);
}

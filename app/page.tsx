import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/modules/auth/constants";
import { getOptionalSession } from "@/modules/auth/lib/route-guard";
import { ROLE_HOME_PATH } from "@/shared/rbac";

export default async function HomePage() {
  const session = await getOptionalSession();
  redirect(session ? ROLE_HOME_PATH[session.role] : AUTH_ROUTES.login);
}

import "server-only";
import { requireRole, type Role } from "@/shared/rbac";
import { enforceRateLimit } from "./rate-limit";
export async function authorizeAction(roles: Role[]) {
  const user = await requireRole(roles);
  await enforceRateLimit("action", user.id, 90, 60);
  return user;
}

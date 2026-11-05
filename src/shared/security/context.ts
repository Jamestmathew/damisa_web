import "server-only";
import { cacheRequest as cache } from "@/shared/security/request-cache";
import { requireAuth } from "@/modules/auth/lib/route-guard";

export const getContext = cache(async () => {
  const user = await requireAuth();
  if (!user.officeId)
    throw new Error(
      "Your account must be assigned to an office before using this feature.",
    );
  return { user, officeId: user.officeId };
});

import { redirect } from "next/navigation";
import { requireAuth } from "@/modules/auth/lib/route-guard";
export default async function ChangePasswordPage() {
  const user = await requireAuth();
  const portal = user.role === "super_admin" ? "super-admin" : user.role;
  redirect(`/${portal}/settings#password`);
}

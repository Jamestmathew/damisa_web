import { redirect } from "next/navigation";
export default function StudentChangePasswordPage() {
  redirect("/student/settings#password");
}

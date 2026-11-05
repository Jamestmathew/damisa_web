import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/admin";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Cron is not configured." },
      { status: 503 },
    );
  const expected = Buffer.from(`Bearer ${secret}`);
  const supplied = Buffer.from(request.headers.get("authorization") ?? "");
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    return new NextResponse("Unauthorized", { status: 401 });
  const { error } = await createAdminClient().rpc("cleanup_lms_rate_limits");
  if (error)
    return NextResponse.json({ error: "Maintenance failed." }, { status: 500 });
  const attendance = await createAdminClient().rpc("attendance_finalize_due");
  if (attendance.error)
    return NextResponse.json(
      { error: "Attendance finalization failed." },
      { status: 500 },
    );
  return NextResponse.json({ success: true, finalizedDays: attendance.data });
}

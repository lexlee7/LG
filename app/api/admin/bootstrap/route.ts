import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/store";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await getAdminDashboardData();
  return NextResponse.json({ ok: true, summary: data.summary });
}

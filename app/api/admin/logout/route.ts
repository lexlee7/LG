import { redirect } from "next/navigation";

import { clearAdminSession } from "@/lib/auth";

export async function POST() {
  await clearAdminSession();
  redirect("/admin");
}

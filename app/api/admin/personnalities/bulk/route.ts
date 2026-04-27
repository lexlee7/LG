import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { importPersonalitiesCsv } from "@/lib/store";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin?error=auth");
  }

  const formData = await request.formData();
  const csv = String(formData.get("csv") ?? "");
  await importPersonalitiesCsv(csv);

  revalidatePath("/");
  revalidatePath("/personnalites");
  revalidatePath("/admin");
  redirect("/admin?success=bulk-personalities");
}

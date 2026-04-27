import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { importFactsCsv } from "@/lib/store";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin?error=auth");
  }

  const formData = await request.formData();
  const csv = String(formData.get("csv") ?? "");
  const previewOnly = String(formData.get("previewOnly") ?? "") === "true";
  const resetExisting = String(formData.get("resetExisting") ?? "") === "true";

  const report = await importFactsCsv(csv, "admin", {
    mode: previewOnly ? "preview" : "import",
    resetExisting,
  });

  if (!previewOnly) {
    revalidatePath("/");
    revalidatePath("/faits");
    revalidatePath("/admin");
    redirect(
      `/admin?success=facts-imported&created=${report.created}&skipped=${report.skipped}`,
    );
  }

  revalidatePath("/admin");
  redirect("/admin?success=facts-preview");
}

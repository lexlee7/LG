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
  const mode = formData.get("previewOnly") === "true" ? "preview" : "import";
  const resetExisting = formData.get("resetExisting") === "true";

  const report = await importPersonalitiesCsv(csv, "admin", {
    mode,
    resetExisting,
  });

  revalidatePath("/");
  revalidatePath("/personnalites");
  revalidatePath("/admin");
  redirect(
    `/admin?success=${mode === "import" ? "import-personnalities" : "preview-personnalities"}&created=${report.created}&skipped=${report.skipped}`,
  );
}

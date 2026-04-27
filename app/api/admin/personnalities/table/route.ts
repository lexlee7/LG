import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { updatePersonalityTableRow } from "@/lib/store";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.redirect(new URL("/admin?error=auth", request.url));
  }

  const formData = await request.formData();
  await updatePersonalityTableRow({
    id: Number(formData.get("personalityId")),
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? ""),
    country: String(formData.get("country") ?? "France"),
    party: String(formData.get("party") ?? ""),
    wikipediaUrl: String(formData.get("wikipediaUrl") ?? ""),
    isFeatured: String(formData.get("isFeatured") ?? "") === "true",
  });

  revalidatePath("/");
  revalidatePath("/personnalites");
  revalidatePath("/admin");
  return NextResponse.redirect(new URL("/admin?updated=table", request.url));
}

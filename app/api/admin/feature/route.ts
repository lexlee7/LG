import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { setFeatureState } from "@/lib/store";

const schema = z.object({
  entityType: z.enum(["personality", "fact"]),
  entityId: z.coerce.number().int().positive(),
  featured: z
    .string()
    .transform((value) => value === "true")
    .pipe(z.boolean()),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.redirect(new URL("/admin?error=unauthorized", request.url));
  }

  const formData = await request.formData();
  const parsed = schema.safeParse({
    entityType: formData.get("entityType"),
    entityId: formData.get("entityId"),
    featured: formData.get("featured"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/admin?error=feature", request.url));
  }

  await setFeatureState(parsed.data.entityType, parsed.data.entityId, parsed.data.featured, "admin");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/personnalites");
  revalidatePath("/faits");
  return NextResponse.redirect(new URL("/admin?updated=feature", request.url));
}
